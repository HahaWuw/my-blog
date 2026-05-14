/**
 * 七牛云直传：小文件表单上传，大文件分片上传
 */

const UPLOAD_HOST = "https://up.qiniup.com"
/** 分片阈值：超过此大小使用分片上传（5MB） */
const MULTIPART_THRESHOLD = 5 * 1024 * 1024
/** 每片大小（4MB，七牛要求除最后一片外 >= 1MB） */
const CHUNK_SIZE = 4 * 1024 * 1024

export type UploadTokenResult = {
  token: string
  domain: string
  key: string
  bucket?: string
}

function base64UrlEncode(str: string): string {
  const bytes = new TextEncoder().encode(str)
  let binary = ""
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

export async function getUploadToken(filename?: string): Promise<UploadTokenResult> {
  const res = await fetch("/api/qiniu/upload-token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ filename: filename || "" }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || "获取上传凭证失败")
  }
  return res.json()
}

/** 表单上传（小文件） */
function formUpload(
  file: File,
  token: string,
  domain: string,
  key: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  const form = new FormData()
  form.append("token", token)
  form.append("key", key)
  form.append("file", file)

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100))
      }
    })
    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(domain ? `${domain}/${key}` : key)
      } else {
        try {
          const body = JSON.parse(xhr.responseText || "{}")
          reject(new Error(body.error || body.message || "上传失败"))
        } catch {
          reject(new Error("上传失败"))
        }
      }
    })
    xhr.addEventListener("error", () => reject(new Error("网络错误")))
    xhr.open("POST", UPLOAD_HOST)
    xhr.send(form)
  })
}

/** 分片上传 v2：初始化 */
async function initMultipart(
  token: string,
  bucket: string,
  encodedKey: string
): Promise<{ uploadId: string }> {
  const res = await fetch(
    `${UPLOAD_HOST}/buckets/${bucket}/objects/${encodedKey}/uploads`,
    {
      method: "POST",
      headers: {
        Authorization: `UpToken ${token}`,
        "Content-Type": "application/json",
      },
    }
  )
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || "初始化分片上传失败")
  }
  const data = await res.json()
  return { uploadId: data.uploadId }
}

/** 分片上传 v2：上传一个 part */
async function uploadPart(
  token: string,
  bucket: string,
  encodedKey: string,
  uploadId: string,
  partNumber: number,
  blob: Blob
): Promise<{ etag: string }> {
  const res = await fetch(
    `${UPLOAD_HOST}/buckets/${bucket}/objects/${encodedKey}/uploads/${uploadId}/${partNumber}`,
    {
      method: "PUT",
      headers: {
        Authorization: `UpToken ${token}`,
        "Content-Type": "application/octet-stream",
        "Content-Length": String(blob.size),
      },
      body: blob,
    }
  )
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || `分片 ${partNumber} 上传失败`)
  }
  const data = await res.json()
  return { etag: data.etag }
}

/** 分片上传 v2：完成 */
async function completeMultipart(
  token: string,
  bucket: string,
  encodedKey: string,
  uploadId: string,
  parts: { partNumber: number; etag: string }[]
): Promise<void> {
  const res = await fetch(
    `${UPLOAD_HOST}/buckets/${bucket}/objects/${encodedKey}/uploads/${uploadId}`,
    {
      method: "POST",
      headers: {
        Authorization: `UpToken ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ parts }),
    }
  )
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || "完成分片上传失败")
  }
}

/** 分片上传（大文件） */
async function uploadToQiniuMultipart(
  file: File,
  token: string,
  domain: string,
  key: string,
  bucket: string,
  onProgress?: (percent: number) => void
): Promise<string> {
  const encodedKey = base64UrlEncode(key)
  const { uploadId } = await initMultipart(token, bucket, encodedKey)

  const totalChunks = Math.ceil(file.size / CHUNK_SIZE)
  const parts: { partNumber: number; etag: string }[] = []
  let uploaded = 0

  for (let i = 0; i < totalChunks; i++) {
    const start = i * CHUNK_SIZE
    const end = Math.min(start + CHUNK_SIZE, file.size)
    const blob = file.slice(start, end)
    const partNumber = i + 1
    const { etag } = await uploadPart(
      token,
      bucket,
      encodedKey,
      uploadId,
      partNumber,
      blob
    )
    parts.push({ partNumber, etag })
    uploaded += blob.size
    if (onProgress) {
      onProgress(Math.round((uploaded / file.size) * 100))
    }
  }

  parts.sort((a, b) => a.partNumber - b.partNumber)
  await completeMultipart(token, bucket, encodedKey, uploadId, parts)
  return domain ? `${domain}/${key}` : key
}

/**
 * 上传文件到七牛：小于阈值用表单上传，大于等于阈值用分片上传
 */
export async function uploadToQiniu(
  file: File,
  onProgress?: (percent: number) => void
): Promise<string> {
  const { token, domain, key, bucket } = await getUploadToken(file.name)

  if (file.size >= MULTIPART_THRESHOLD && bucket) {
    return uploadToQiniuMultipart(file, token, domain, key, bucket, onProgress)
  }

  return formUpload(file, token, domain, key, onProgress)
}
