== Pakwheels ==
Endpoint: 
 POST - https://s3.amazonaws.com/uploads.pakwheels.com/

Payload:
 name: 485511668-800x600.webp
 key: originals/${filename}
 Filename: $filename
 AWSAccessKeyId: AKIAJ7IBNWAS4OW6C7QA
 policy: eyJleHBpcmF0aW9uIjoiMjAyNS0wNi
 signature: 2kEYjuYJW5n0w2DSKN572dH2yzA=
 utf8: true
 acl: public-read
 success_action_status: 201
 Content-Type: image/webp
 file: (binary)

Response:
 <?xml version="1.0" encoding="UTF-8"?>
 <PostResponse><Location>https://s3.amazonaws.com/uploads.pakwheels.com/originals%2F485511668-800x600.webp</Location><Bucket>uploads.pakwheels.com</Bucket><Key>originals/485511668-800x600.webp</Key><ETag>"e637b35f9a5957f7ea8d83e4c2321cef"</ETag></PostResponse>

====================================================================================================================================================================================================================================================================

== OLX ==
Endpoint:
 GET - https://www.olx.com.pk/api/getUploadSignedURL/temp?imageName=5d2ea9e9-d9ea-40ca-bc7f-066c3e5f83fd-971c4fb1-c7bc-4687-aaa9-6a34dddaa17c&acl=public-read&methodType=POST

Payload:
 imageName: 5d2ea9e9-d9ea-40ca-bc7f-066c3e5f83fd-971c4fb1-c7bc-4687-aaa9-6a34dddaa17c
 acl: public-read
 methodType: POST

Response:
 {
    "url": "https://olx-pk-prod.s3.amazonaws.com/",
    "fields": {
        "ACL": "public-read",
        "Content-Type": "image/jpeg",
        "key": "temp/5d2ea9e9-d9ea-40ca-bc7f-066c3e5f83fd-971c4fb1-c7bc-4687-aaa9-6a34dddaa17c.jpg",
        "AWSAccessKeyId": "AKIAVX7TDWCAMSXOKAMZ",
        "policy": "eyJleHBpcmFV0IjogIm9TktZ3MWM0ZmIxGRhYTE3Yy5qcGcifV19",
        "signature": "8eY2euKKcF3HmezWsw8d48+R0yw="
    }
 }

====================================================================================================================================================================================================================================================================

== OUR CASE ==
Endpoint:
 POST  - /aws-s3/get-presigned-urls

Payload:
 {
  "folderName": "uploads",
  "fileNames": ["image1.png"]
 }

Response:
 {
  "success": true,
  "data": [
    {
      "url": "https://s3-my-bucket.s3.amazonaws.com/",
      "fields": {
        "acl": "public-read",
        "key": "uploads/1752650800655_image1.png",
        "Content-Type": "image/png",
        "bucket": "my-bucket",
        "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
        "X-Amz-Credential": "AKIAWSZEELED5/s3/aws4_request",
        "X-Amz-Date": "20250716T072640Z",
        "Policy": "eyJleHBpcmF0aW9uIjoiMjAyNS0wNy0xNl...",
        "X-Amz-Signature": "d2f9a0e7ec53ccfae..."
      }
    }
  ]
 }

Upload to S3 (Client Side):
 Next, the frontend uploads the image using a POST request to the url received, with a FormData payload:
 await Promise.all(
  response.data.map(async (item, i) => {
    const formData = new FormData();
    Object.entries(item.fields).forEach(([key, value]) => {
      formData.append(key, value);
    });
    formData.append('file', filesToUpload[i]);
    await axios.post(item.url, formData);
  })
 );

Note: This request returns no response body.

Final Image URL:
 The final image URL is constructed by combining: response.data.url + response.data.fields.key. e.g. https://s3-my-bucket.s3.amazonaws.com/uploads/1752650800655_image1.png
