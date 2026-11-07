from pathlib import Path

from docx import Document
from pypdf import PdfReader


class UnsupportedFileError(ValueError):
    pass


class DocumentTextExtractor:
    def extract(self, path: Path, file_type: str) -> str:
        if file_type == "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
            document = Document(path)
            parts = [paragraph.text for paragraph in document.paragraphs]
            parts.extend(
                cell.text
                for table in document.tables
                for row in table.rows
                for cell in row.cells
            )
            return "\n".join(part for part in parts if part.strip())
        if file_type == "application/pdf":
            reader = PdfReader(str(path))
            return "\n".join(page.extract_text() or "" for page in reader.pages)
        raise UnsupportedFileError("Only .docx and .pdf files are supported.")
