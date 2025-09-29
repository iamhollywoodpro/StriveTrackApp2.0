const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = 'https://rftjybtdvfffzqgotdly.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmdGp5YnRkdmZmZnpxZ290ZGx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMTQ0MTMsImV4cCI6MjA3Mzc5MDQxM30.x1jA2cWY8w_twtJ7-JaFvhAFvwrVtTGpQSsqaBBJx6c'
const WORKER_URL = 'https://strivetrack-media-api.iamhollywoodpro.workers.dev'

async function debugR2vsD1() {
  console.log('🔍 Debugging R2 vs D1 Media Storage Mismatch')
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
    const userId = data.user.id
    console.log('✅ Authentication successful')
    console.log('User ID:', userId)
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
    
    // Check what the current /api/media endpoint returns (D1 first, R2 fallback)
    console.log('\n📊 Current /api/media response (D1 + R2 fallback):')
    const mediaResponse = await fetch(`${WORKER_URL}/api/media`, { headers })
    const mediaData = await mediaResponse.json()
    
    console.log('Media API Status:', mediaResponse.status)
    console.log('Total media items returned:', mediaData?.items?.length || 0)
    
    if (mediaData?.items?.length > 0) {
      console.log('\nFirst few items:')
      mediaData.items.slice(0, 3).forEach((item, i) => {
        console.log(`${i + 1}. Key: ${item.key}`)
        console.log(`   Content-Type: ${item.contentType}`)
        console.log(`   Created: ${item.createdAt}`)
      })
    }
    
    // Now let's manually test if these files actually exist in R2
    console.log('\n🗄️ Testing R2 file existence:')
    if (mediaData?.items?.length > 0) {
      for (let i = 0; i < Math.min(3, mediaData.items.length); i++) {
        const item = mediaData.items[i]
        console.log(`\n${i + 1}. Testing: ${item.key}`)
        
        // Try to access the file directly through Worker
        const fileUrl = `${WORKER_URL}/api/media/${encodeURIComponent(item.key)}?token=${encodeURIComponent(token)}`
        
        try {
          const fileResponse = await fetch(fileUrl, { method: 'HEAD' })
          console.log(`   Status: ${fileResponse.status}`)
          console.log(`   Content-Type: ${fileResponse.headers.get('content-type')}`)
          
          if (fileResponse.status === 404) {
            console.log(`   ❌ File NOT in R2 (404 Not Found)`)
          } else if (fileResponse.status === 200) {
            console.log(`   ✅ File EXISTS in R2`)
          } else {
            console.log(`   ⚠️  Unexpected status: ${fileResponse.status}`)
          }
        } catch (err) {
          console.log(`   ❌ Error accessing file: ${err.message}`)
        }
      }
    }
    
    // Test cleanup - let's clear D1 of non-existent files
    console.log('\n🧹 Testing D1 cleanup for missing R2 files...')
    
    // Create a simple endpoint test to see what's actually in R2
    const testUpload = await testFileUpload(token)
    if (testUpload) {
      console.log('✅ Upload test successful - R2 is working')
    } else {
      console.log('❌ Upload test failed - R2 may have issues')
    }
    
  } catch (err) {
    console.error('❌ Debug error:', err)
  }
}

async function testFileUpload(token) {
  console.log('\n📤 Testing file upload to verify R2 functionality...')
  
  try {
    // Create a simple test file
    const testContent = 'test file content for R2 verification'
    const testBlob = Buffer.from(testContent, 'utf8')
    
    const uploadResponse = await fetch(`${WORKER_URL}/api/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'text/plain',
        'x-file-name': 'test-upload.txt'
      },
      body: testBlob
    })
    
    console.log('Upload Status:', uploadResponse.status)
    const uploadResult = await uploadResponse.json()
    console.log('Upload Result:', uploadResult)
    
    if (uploadResponse.ok && uploadResult.key) {
      // Try to download it immediately
      const downloadUrl = `${WORKER_URL}/api/media/${encodeURIComponent(uploadResult.key)}?token=${encodeURIComponent(token)}`
      const downloadResponse = await fetch(downloadUrl)
      
      console.log('Download Status:', downloadResponse.status)
      
      if (downloadResponse.ok) {
        const content = await downloadResponse.text()
        console.log('Downloaded Content:', content)
        console.log('✅ Upload/Download cycle successful')
        
        // Clean up test file
        await fetch(`${WORKER_URL}/api/media/${encodeURIComponent(uploadResult.key)}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        })
        
        return true
      } else {
        console.log('❌ Download failed immediately after upload')
        return false
      }
    } else {
      console.log('❌ Upload failed')
      return false
    }
  } catch (err) {
    console.error('❌ Upload test error:', err.message)
    return false
  }
}

debugR2vsD1().catch(console.error)