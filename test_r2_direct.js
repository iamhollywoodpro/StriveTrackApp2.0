const { createClient } = require('@supabase/supabase-js')

const SUPABASE_URL = 'https://rftjybtdvfffzqgotdly.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmdGp5YnRkdmZmZnpxZ290ZGx5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTgyMTQ0MTMsImV4cCI6MjA3Mzc5MDQxM30.x1jA2cWY8w_twtJ7-JaFvhAFvwrVtTGpQSsqaBBJx6c'
const WORKER_URL = 'https://strivetrack-media-api.iamhollywoodpro.workers.dev'

async function testR2Direct() {
  console.log('🔧 Testing R2 Access Directly Through Worker')
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
    
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'text/plain'
    }
    
    // Test 1: Simple text upload with explicit content-type
    console.log('\n📤 Test 1: Simple text upload...')
    const testContent = `Test upload at ${new Date().toISOString()}`
    
    const uploadResponse = await fetch(`${WORKER_URL}/api/upload`, {
      method: 'POST',
      headers: {
        ...headers,
        'x-file-name': 'debug-test.txt'
      },
      body: testContent
    })
    
    console.log('Upload Status:', uploadResponse.status)
    
    if (uploadResponse.ok) {
      const uploadResult = await uploadResponse.json()
      console.log('Upload Key:', uploadResult.key)
      
      // Test 2: Immediate download test
      console.log('\n📥 Test 2: Immediate download test...')
      const downloadUrl = `${WORKER_URL}/api/media/${encodeURIComponent(uploadResult.key)}?token=${encodeURIComponent(token)}`
      
      // Wait a moment then try
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const downloadResponse = await fetch(downloadUrl)
      console.log('Download Status:', downloadResponse.status)
      
      if (downloadResponse.ok) {
        const downloadedContent = await downloadResponse.text()
        console.log('Downloaded Content:', downloadedContent)
        console.log('Match Original:', downloadedContent === testContent ? '✅' : '❌')
      } else {
        const errorText = await downloadResponse.text()
        console.log('Download Error:', errorText)
      }
      
      // Test 3: Check media listing
      console.log('\n📋 Test 3: Check media listing...')
      const listResponse = await fetch(`${WORKER_URL}/api/media`, { headers: { 'Authorization': `Bearer ${token}` } })
      const listData = await listResponse.json()
      
      console.log('List Status:', listResponse.status)
      console.log('Total Items:', listData?.items?.length || 0)
      
      const ourItem = listData?.items?.find(item => item.key === uploadResult.key)
      console.log('Our Upload in List:', ourItem ? '✅ Found' : '❌ Missing')
      
      if (ourItem) {
        console.log('Item URL:', ourItem.url)
        
        // Test the generated URL
        console.log('\n🔗 Test 4: Generated URL test...')
        const generatedResponse = await fetch(ourItem.url)
        console.log('Generated URL Status:', generatedResponse.status)
        
        if (generatedResponse.ok) {
          console.log('✅ Generated URL works!')
        } else {
          console.log('❌ Generated URL failed')
        }
      }
      
    } else {
      const errorText = await uploadResponse.text()
      console.log('Upload Error:', errorText)
    }
    
  } catch (err) {
    console.error('❌ Test error:', err)
  }
}

testR2Direct().catch(console.error)