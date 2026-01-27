import CreatePosts from "@/components/createPosts"
import { createClient } from "@/utils/supabase/server";

export default async function Addarticle() {
    const supabase = await createClient()
  
    const { data: posts, error } = await supabase.from('posts').select('title, content')
    return (
        <div>
            {JSON.stringify(posts)}
            <CreatePosts></CreatePosts> 
       </div>
    )
}