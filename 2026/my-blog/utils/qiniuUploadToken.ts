import { createHmac } from "crypto"

/** 与七牛 Node SDK `util.base64ToUrlSafe` 一致 */
function base64ToUrlSafe(v: string): string {
  return v.replace(/\//g, "_").replace(/\+/g, "-")
}

/** 与七牛 Node SDK `util.urlsafeBase64Encode` 一致 */
function urlsafeBase64Encode(utf8String: string): string {
  const encoded = Buffer.from(utf8String, "utf8").toString("base64")
  return base64ToUrlSafe(encoded)
}

export type BuildUploadTokenOptions = {
  accessKey: string
  secretKey: string
  bucket: string
  /** 策略过期时间（秒），默认 3600 */
  expiresSeconds?: number
  /** 七牛上传成功回调 returnBody 模板，可选 */
  returnBody?: string
}

/**
 * 生成浏览器直传用的七牛上传凭证（不依赖 `qiniu` npm 包，避免 urllib/proxy-agent 被打包进 Next）。
 * 算法与官方 PutPolicy.uploadToken 一致。
 * @see https://developer.qiniu.com/kodo/manual/1206/put-policy
 */
export function buildQiniuUploadToken({
  accessKey,
  secretKey,
  bucket,
  expiresSeconds = 3600,
  returnBody,
}: BuildUploadTokenOptions): string {
  const flags: Record<string, string | number> = {
    scope: bucket,
    deadline: Math.floor(Date.now() / 1000) + expiresSeconds,
  }
  if (returnBody != null && returnBody !== "") {
    flags.returnBody = returnBody
  }

  const encodedFlags = urlsafeBase64Encode(JSON.stringify(flags))
  const sign = createHmac("sha1", secretKey)
    .update(encodedFlags, "utf8")
    .digest("base64")
  const encodedSign = base64ToUrlSafe(sign)
  return [accessKey, encodedSign, encodedFlags].join(":")
}
