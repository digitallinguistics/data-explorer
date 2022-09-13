export default function get(req, res) {
  res.render(`Component/Component`, {
    component: `Notes/Notes`,
    data:      [
      {
        dateCreated:  `2020-01-01T00:00:00.000Z`,
        dateModified: `2022-01-01T00:00:00.000Z`,
        source:       `JS`,
        text:         `This is an example of a note. Qui id proident sit tempor ut exercitation sit reprehenderit. Nulla sit magna culpa irure culpa eu cillum ullamco. Ea veniam commodo aute enim duis amet magna sunt nostrud. Ullamco aute duis ullamco aliquip ipsum in do labore ad exercitation nostrud ad. Voluptate fugiat in ullamco in irure quis sint fugiat qui.`,
      },
      {
        dateCreated:  `2020-01-01T00:00:00.000Z`,
        dateModified: `2022-01-01T00:00:00.000Z`,
        source:       `JS`,
        text:         `This is an example of a note. Qui id proident sit tempor ut exercitation sit reprehenderit. Nulla sit magna culpa irure culpa eu cillum ullamco. Ea veniam commodo aute enim duis amet magna sunt nostrud. Ullamco aute duis ullamco aliquip ipsum in do labore ad exercitation nostrud ad. Voluptate fugiat in ullamco in irure quis sint fugiat qui.`,
      },
      {
        dateCreated:  `2020-01-01T00:00:00.000Z`,
        dateModified: `2022-01-01T00:00:00.000Z`,
        source:       `JS`,
        text:         `This is an example of a note. Qui id proident sit tempor ut exercitation sit reprehenderit. Nulla sit magna culpa irure culpa eu cillum ullamco. Ea veniam commodo aute enim duis amet magna sunt nostrud. Ullamco aute duis ullamco aliquip ipsum in do labore ad exercitation nostrud ad. Voluptate fugiat in ullamco in irure quis sint fugiat qui.`,
      },
    ],
    layout:    false,
    styles:    [
      `Note`,
      `Notes`,
    ],
  })
}
