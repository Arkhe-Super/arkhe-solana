from playwright.sync_api import sync_playwright

def run_cuj(page):
    # Set default language to English in localStorage before starting
    page.goto("http://localhost:5173")
    page.evaluate("localStorage.setItem('i18nextLng', 'en')")
    page.reload()
    page.wait_for_timeout(2000)

    # Total time target: > 1 min, < 3 min. (87 seconds + more wait time)

    print("Dashboard")
    page.goto("http://localhost:5173/creator")
    for i in range(15): # 15 seconds
        page.wait_for_timeout(1000)

    print("Provenance")
    page.goto("http://localhost:5173/wormgraph")
    for i in range(15): # 15 seconds
        page.wait_for_timeout(1000)

    print("Royalties")
    page.goto("http://localhost:5173/royalties")
    for i in range(15): # 15 seconds
        page.wait_for_timeout(1000)

    print("Registration")
    page.goto("http://localhost:5173/registration")
    for i in range(15): # 15 seconds
        page.wait_for_timeout(1000)

    print("Demo case")
    page.goto("http://localhost:5173/demo")
    page.wait_for_timeout(3000)

    print("Playing demo...")
    try:
        page.get_by_role("button", name="Load \"Taj Mahal\"").click()
        page.wait_for_timeout(2000)
        page.get_by_role("button", name="Load \"Da Ya Think...\"").click()
        page.wait_for_timeout(3000)

        page.get_by_role("button", name="Register in WormGraph").click()
        for i in range(5):
            page.wait_for_timeout(1000)

        page.get_by_role("button", name="Compare Works").click()
        for i in range(5):
            page.wait_for_timeout(1000)

        page.get_by_role("button", name="Gerar Prova de Similaridade").click() # Hardcoded in PT in the component
        for i in range(5):
            page.wait_for_timeout(1000)

        page.get_by_role("button", name="Settle Royalties").click()
        for i in range(15): # 15 seconds
            page.wait_for_timeout(1000)

    except Exception as e:
        print("Demo error", e)

    for i in range(10):
        page.wait_for_timeout(1000)

    page.screenshot(path="/home/jules/verification/screenshots/verification_en.png")
    page.wait_for_timeout(1000)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            record_video_dir="/home/jules/verification/videos",
            viewport={'width': 1280, 'height': 800}
        )
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
