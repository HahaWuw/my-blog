import { NextResponse } from "next/server"
import { buildQiniuUploadToken } from "@/utils/qiniuUploadToken"

const accessKey = process.env.QINIU_ACCESS_KEY
const secretKey = process.env.QINIU_SECRET_KEY
const bucket = process.env.QINIU_BUCKET
const domain = process.env.QINIU_DOMAIN || ""

export async function POST(request: Request) {
  if (!accessKey || !secretKey || !bucket) {
    return NextResponse.json(
      { error: "七牛云配置缺失：请设置 QINIU_ACCESS_KEY、QINIU_SECRET_KEY、QINIU_BUCKET" },
      { status: 500 }
    )
  }

  try {
    const body = await request.json().catch(() => ({}))
    const filename = (body.filename as string) || ""
    const ext = filename.includes(".")
      ? filename.slice(filename.lastIndexOf("."))
      : ""
    const key = `uploads/${Date.now()}-${Math.random().toString(36).slice(2, 10)}${ext}`

    const token = buildQiniuUploadToken({
      accessKey,
      secretKey,
      bucket,
      expiresSeconds: 3600,
      returnBody:
        '{"key":"$(key)","hash":"$(etag)","fsize":$(fsize),"bucket":"$(bucket)"}',
    })

    return NextResponse.json({
      token,
      domain: domain.replace(/\/$/, ""),
      key,
      bucket,
    })
  } catch (e) {
    console.error("Qiniu upload token error:", e)
    return NextResponse.json({ error: "生成上传凭证失败" }, { status: 500 })
  }
}
