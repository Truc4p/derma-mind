import google.generativeai as genai

genai.configure(api_key="AIzaSyA02nsG75qUblT_aiS8r8x2iLcIg9k18mQ")

model = genai.GenerativeModel('gemini-2.5-flash')

response = model.generate_content("Explain the benefits of using niacinamide in skincare.")
print(response.text)