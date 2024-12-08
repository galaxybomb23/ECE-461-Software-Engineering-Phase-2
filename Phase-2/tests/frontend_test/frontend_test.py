from selenium import webdriver
from selenium.webdriver.common.by import By
import time

chrome_options = webdriver.ChromeOptions()
driver = webdriver.Chrome(options=chrome_options)

try:
    url = "http://54.224.103.25/login"
    print(f"Opening {url}...")
    driver.get(url)

    time.sleep(2)

    admin_toggle = driver.find_element(By.ID, "admin-toggle")
    driver.execute_script("arguments[0].click();", admin_toggle)

    login_button = driver.find_element(By.XPATH, "//button[contains(text(), 'Log In')]")
    login_button.click()

    username_field = driver.find_element(By.ID, "username")
    password_field = driver.find_element(By.ID, "password")

    username = "ece30861defaultadminuser"
    password = "correcthorsebatterystaple123(!__+@**(A'\"`;DROP TABLE packages;"
    # correcthorsebatterystaple123(!__+@**(A'"`;DROP TABLE packages;

    username_field.send_keys(username)
    password_field.send_keys(password)

    login_button.click()

    print("Attempted login with provided credentials.")
    time.sleep(5) 

    print("Current Page Title:", driver.title)
    print("Current URL:", driver.current_url)

finally:
    print("Closing the browser...")
    driver.quit()
