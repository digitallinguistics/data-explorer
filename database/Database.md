# Database Model

The DLx database has two containers:

- `data`
- `metadata`

## Data

The `data` container contains Lexemes and Texts. This container is partitioned by language (partition key `/language/id`). As such, all items in the `data` container must have a `language` property whose value is an object with, minimally, an `id` property. Each item in the container must also have a `"type"` of either `"Lexeme"` or `"Text"`. As an example:

```json
{
  "type": "Lexeme",
  "language": {
    "id": "f8a669d3-131b-44f3-88ab-edaa33604202",
    "name": {
      "eng": "Chitimacha"
    }
  }
}
```

## Metadata

The `metadata` container contains all other types of database objects. Each item in this container must have a `"type"` property, which is also its partition key (`/type`).

### Types of Metadata

- `BibliographicReference`
- `Language`
- `Location`
- `Media`
- `Person`
