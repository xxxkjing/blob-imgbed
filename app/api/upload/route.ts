// app/api/upload/route.ts
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

// 处理文件上传请求
export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    // 使用 Vercel Blob 的 handleUpload 处理上传
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => ({
        // 定义上传限制
        allowedContentTypes: ['image/*'], // 仅接受图片类型
        maximumSizeInBytes: 50 * 1024 * 1024, // 最大 50MB
      }),
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // 上传完成后的回调，记录日志
        console.log('Blob upload completed:', blob.url, tokenPayload);
      },
    });

    return NextResponse.json(jsonResponse); // 返回上传结果
  } catch (error) {
    // 捕获并返回错误
    console.error('Upload error:', (error as Error).message);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 }
    );
  }
}