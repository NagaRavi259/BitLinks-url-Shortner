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

    await insertLink(body.url, body.shortUrl);

    return Response.json({success: true , error: false, message: 'Short URL generated successfully' })
  }