// 1. Service Worker (background.js)
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "analyzePageContent") {
    chrome.scripting.executeScript(
      {
        target: { tabId: sender.tab.id },
        func: () => {
          const textContent = document.body.innerText;
          const metadata = {
            url: window.location.href,
            title: document.title,
            keywords: Array.from(document.querySelectorAll('meta[name="keywords"]'))
              .map(meta => meta.content).join(', ')
          };
          return { textContent, metadata };
        }
      },
      (results) => {
        if (chrome.runtime.lastError) {
          sendResponse({ error: "Failed to extract content" });
          return;
        }
        sendResponse(results[0].result);
      }
    );
    return true; // Keep message channel open
  }
});