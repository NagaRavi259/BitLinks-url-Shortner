import { redirect } from "next/navigation"
import { findLink } from "@/app/lib/db"

export default async function Page({ params }) {
    const shorturl = (await params).shorturl

    const shortUrlExists = await findLink(shorturl);
    if(shortUrlExists){
         redirect(shortUrlExists.url);
    }
    else{
        redirect(process.env.NEXT_PUBLIC_BASE_URL)
    }

    return <div>My Post: {url}</div>
  }