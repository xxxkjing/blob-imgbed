// app/api/moderate/route.ts
import { NextResponse } from 'next/server';

const SIGHTENGINE_MODERATION_URL = 'https://api.sightengine.com/1.0/check.json';

// 检查环境变量并返回字符串
function getEnvVar(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }
  return value;
}

async function moderateImage(file: File): Promise<{
  isSafe: boolean;
  reason?: string;
}> {
  const apiUser = getEnvVar('SIGHTENGINE_API_USER');
  const apiSecret = getEnvVar('SIGHTENGINE_API_SECRET');
  console.log('Moderating image with API User:', apiUser ? 'set' : 'not set'); // 调试日志

  const formData = new FormData();
  formData.append('media', file); // 上传文件
  formData.append('api_user', apiUser);
  formData.append('api_secret', apiSecret);
  formData.append('models', 'nudity,violence,offensive'); // 支持的审核模型

  try {
    const response = await fetch(SIGHTENGINE_MODERATION_URL, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text(); // 获取详细错误信息
      console.error('Sightengine API response error:', errorText);
      throw new Error(`Sightengine API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Sightengine API response:', JSON.stringify(result, null, 2)); // 调试完整响应

    // 检查审核结果
    const reasons: string[] = [];
    if (result.nudity?.prob > 0.5) reasons.push('nudity'); // 使用 prob 阈值判断
    if (result.violence?.prob > 0.5) reasons.push('violence');
    if (result.offensive?.prob > 0.5) reasons.push('offensive content');

    const isSafe = reasons.length === 0;
    const reason = isSafe ? undefined : `Image contains: ${reasons.join(', ')}`;

    return { isSafe, reason };
  } catch (error) {
    console.error('Sightengine moderation failed:', error);
    throw error; // 重新抛出错误以便上层处理
  }
}

export async function POST(request: Request): Promise<NextResponse> {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No valid file provided' }, { status: 400 });
    }

    console.log('Received file:', file.name, file.type); // 调试日志

    const { isSafe, reason } = await moderateImage(file as File);

    if (!isSafe) {
      return NextResponse.json(
        { error: reason || 'Image contains inappropriate content' },
        { status: 400 }
      );
    }

    return NextResponse.json({ message: 'Image is safe to upload' });
  } catch (error) {
    console.error('Moderate route error:', error);
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}