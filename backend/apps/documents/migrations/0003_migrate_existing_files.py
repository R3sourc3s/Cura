import os

from django.db import migrations


def move_files_forward(apps, schema_editor):
    """Copy each Document's legacy single file into a DocumentFile row."""
    Document = apps.get_model("documents", "Document")
    DocumentFile = apps.get_model("documents", "DocumentFile")
    for doc in Document.objects.all():
        name = doc.file.name if doc.file else ""
        if not name:
            continue
        if doc.files.exists():
            continue
        DocumentFile.objects.create(
            document=doc,
            file=name,  # reference the same stored path (no physical copy)
            original_name=os.path.basename(name),
            file_size=doc.file_size or 0,
            file_type=doc.file_type or "",
        )


def move_files_backward(apps, schema_editor):
    """Restore the first DocumentFile back onto the legacy Document.file field."""
    Document = apps.get_model("documents", "Document")
    for doc in Document.objects.all():
        first = doc.files.first()
        if first and not doc.file:
            doc.file = first.file.name
            doc.file_size = first.file_size
            doc.file_type = first.file_type
            doc.save(update_fields=["file", "file_size", "file_type"])


class Migration(migrations.Migration):

    dependencies = [
        ("documents", "0002_alter_document_file_documentfile"),
    ]

    operations = [
        migrations.RunPython(move_files_forward, move_files_backward),
    ]
