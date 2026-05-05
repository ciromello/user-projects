import SectionList from "./components/SectionList";

export default function App() {
  // Replace this with a real documentId from MongoDB
  const documentId = "69fa2e0f20727c52cf51120a";

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>📄 Document Sections</h1>

      <SectionList documentId={documentId} />
    </div>
  );
}