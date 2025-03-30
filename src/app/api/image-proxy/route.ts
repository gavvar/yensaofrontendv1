import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  // Lấy URL ảnh từ query params
  const searchParams = request.nextUrl.searchParams;
  const imageUrl = searchParams.get("url");

  if (!imageUrl) {
    return new NextResponse("Missing URL parameter", { status: 400 });
  }

  try {
    // Xử lý URL để đảm bảo trỏ đến backend
    const fullImageUrl = imageUrl.startsWith("http")
      ? imageUrl
      : `http://localhost:8080${
          imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`
        }`;

    console.log(`Proxying image: ${fullImageUrl}`);

    // Tải hình ảnh từ server backend
    const imageResponse = await fetch(fullImageUrl, {
      headers: {
        Accept: "image/*",
      },
      cache: "no-store", // Không cache trong development
    });

    if (!imageResponse.ok) {
      console.error(
        `Failed to fetch image: ${fullImageUrl}, status: ${imageResponse.status}`
      );
      return new NextResponse(
        `Failed to fetch image: ${imageResponse.statusText}`,
        {
          status: imageResponse.status,
        }
      );
    }

    // Lấy dữ liệu hình ảnh từ response
    const imageBuffer = await imageResponse.arrayBuffer();

    // Lấy Content-Type từ response
    const contentType =
      imageResponse.headers.get("content-type") || "image/jpeg";

    // Trả về hình ảnh với headers thích hợp
    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400", // Cache trong 1 ngày
      },
    });
  } catch (error) {
    console.error("Error proxying image:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
