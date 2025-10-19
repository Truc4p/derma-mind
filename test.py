import google.generativeai as genai

genai.configure(api_key="AIzaSyD45yKmp57ntK9UmtJOSii5Shky32FuO0w")

model = genai.GenerativeModel('gemini-2.5-pro')

response = model.generate_content("Explain the theory of relativity in simple terms.")
print(response.text)