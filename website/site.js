for (const button of document.querySelectorAll("[data-copy]")) {
  button.addEventListener("click", async () => {
    const status = document.querySelector(".copy-status");
    try {
      await navigator.clipboard.writeText(
        document.getElementById(button.dataset.copy).textContent,
      );
      status.textContent = "Copied. Paste into your terminal when ready.";
    } catch {
      status.textContent =
        "Copy unavailable. Select and copy the command above.";
    }
  });
}
