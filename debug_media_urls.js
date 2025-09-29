const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = 'https://rftjybtdvfffzqgotdly.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmdGp5YnRkdmZmZnpxZ290ZGx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMTQ0MTMsImV4cCI6MjA3Mzc5MDQxM30.x1jA2cWY8w_twtJ7-JaFvhAFvwrVtTGpQSsqaBBJx6c'
const WORKER_URL = 'https://strivetrack-media-api.iamhollywoodpro.workers.dev'

async function debugMediaURLs() {
  console.log('🔍 Debugging Media URL Generation and Access')
  console.log('=' .repeat(60))
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)
  
  try {
    // Authenticate
    console.log('🔐 Authenticating...')
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'iamhollywoodpro@gmail.com',
      password: 'Hollywood@1981'
    })
    
    if (error) {
      console.error('❌ Authentication failed:', error.message)
      return
    }
    
    const token = data.session.access_token
    console.log('✅ Authentication successful')
    console.log('Token (first 20 chars):', token.substring(0, 20) + '...')
    
    // Get media list
    console.log('\n📸 Fetching media list...')
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
    
    const response = await fetch(`${WORKER_URL}/api/media`, { headers })
    const mediaData = await response.json()
    
    console.log('Media API Status:', response.status)
    console.log('Media Count:', mediaData?.items?.length || 0)
    
    if (mediaData?.items?.length > 0) {
      const firstMedia = mediaData.items[0]
      console.log('\n🔍 Testing first media item:')
      console.log('Key:', firstMedia.key)
      console.log('Content-Type:', firstMedia.contentType)
      console.log('Generated URL:', firstMedia.url)
      
      // Test the actual URL
      console.log('\n🌐 Testing media URL access...')
      try {
        const mediaResponse = await fetch(firstMedia.url, { method: 'HEAD' })
        console.log('Media URL Status:', mediaResponse.status)
        console.log('Media Content-Type:', mediaResponse.headers.get('content-type'))
        console.log('Media Content-Length:', mediaResponse.headers.get('content-length'))
        
        if (mediaResponse.status !== 200) {
          console.log('❌ Media URL failed. Response:', await mediaResponse.text())
        } else {
          console.log('✅ Media URL accessible!')
        }
      } catch (urlError) {
        console.error('❌ Error accessing media URL:', urlError.message)
      }
      
      // Test direct Worker streaming
      console.log('\n🔗 Testing direct Worker streaming...')
      const directUrl = `${WORKER_URL}/api/media/${encodeURIComponent(firstMedia.key)}?token=${encodeURIComponent(token)}`
      console.log('Direct URL:', directUrl)
      
      try {
        const directResponse = await fetch(directUrl, { method: 'HEAD' })
        console.log('Direct Stream Status:', directResponse.status)
        console.log('Direct Content-Type:', directResponse.headers.get('content-type'))
        
        if (directResponse.status !== 200) {
          const errorText = await (await fetch(directUrl)).text()
          console.log('❌ Direct stream failed. Response:', errorText)
        } else {
          console.log('✅ Direct streaming works!')
        }
      } catch (directError) {
        console.error('❌ Error with direct streaming:', directError.message)
      }
    } else {
      console.log('📷 No media items found to test')
    }
    
    // Test delete functionality
    console.log('\n🗑️ Testing delete functionality...')
    if (mediaData?.items?.length > 1) {
      // Use the last item for delete test
      const testMedia = mediaData.items[mediaData.items.length - 1]
      console.log('Testing delete for:', testMedia.key)
      
      const deleteResponse = await fetch(`${WORKER_URL}/api/media/${encodeURIComponent(testMedia.key)}`, {
        method: 'DELETE',
        headers
      })
      
      console.log('Delete Status:', deleteResponse.status)
      const deleteResult = await deleteResponse.json()
      console.log('Delete Result:', deleteResult)
      
      if (deleteResponse.ok) {
        console.log('✅ Delete successful')
        
        // Verify it's gone
        console.log('\n🔍 Verifying deletion...')
        const verifyResponse = await fetch(`${WORKER_URL}/api/media`, { headers })
        const verifyData = await verifyResponse.json()
        console.log('Media count after delete:', verifyData?.items?.length || 0)
        console.log('Delete persistent:', mediaData.items.length > (verifyData?.items?.length || 0) ? '✅ Yes' : '❌ No')
      } else {
        console.log('❌ Delete failed')
      }
    } else {
      console.log('Not enough media items to test delete (need at least 2)')
    }
    
  } catch (err) {
    console.error('❌ Debug error:', err)
  }
}

debugMediaURLs().catch(console.error)