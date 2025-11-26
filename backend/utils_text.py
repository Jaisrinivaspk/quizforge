# utils_text.py

def split_text_into_chunks(text: str, max_chars: int = 1200, overlap: int = 200):
    """
    Split a long string into overlapping chunks of around max_chars.
    This is a simple character-based splitter that's good enough for MVP.
    overlap = how many characters to repeat from the previous chunk
    to keep context.
    """
    if not text:
        return []

    text = text.strip()
    length = len(text)
    chunks = []
    start = 0

    while start < length:
        end = start + max_chars
        if end >= length:
            # last chunk
            chunk = text[start:length]
            chunks.append(chunk.strip())
            break

        # take tentative chunk
        chunk = text[start:end]

        # try not to cut mid-sentence: look for last period
        last_period = chunk.rfind(".")
        if last_period != -1 and (start + last_period + 1) < length:
            # cut at period
            end = start + last_period + 1
            chunk = text[start:end]

        chunks.append(chunk.strip())

        # move start forward, but keep some overlap
        start = max(end - overlap, 0)

        # safety: if we somehow don't move, break to avoid infinite loop
        if start >= length:
            break

    return chunks

