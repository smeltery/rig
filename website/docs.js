import mermaid from "mermaid";
mermaid.initialize({
  startOnLoad: false,
  securityLevel: "strict",
  theme: "dark",
});
try {
  await mermaid.run({ querySelector: ".mermaid" });
} catch (error) {
  console.error("Diagram rendering failed", error);
  for (const diagram of document.querySelectorAll(".mermaid")) {
    diagram.setAttribute(
      "aria-label",
      "Diagram source; visual rendering unavailable",
    );
  }
}
