import { findLink, insertLink } from "@/app/lib/db"

export async function POST(request) {

    const body = await request.json();

    // if shorturl already exists
    const shortUrlExists = await findLink(body.shortUrl);
    if(shortUrlExists){
        return Response.json({success: false, error: true, message: 'short URL already exists'}, {
            status: 400
        });
    }

    let targetUrl = body.url;
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
        targetUrl = `https://${targetUrl}`;
    }

    await insertLink(targetUrl, body.shortUrl);

    return Response.json({success: true , error: false, message: 'Short URL generated successfully' })
  }