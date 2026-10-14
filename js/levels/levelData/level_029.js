'use strict';

module.exports = {
  "id": 29,
  "name": "大师 29",
  "colors": [
    "red",
    "blue",
    "yellow",
    "green",
    "purple"
  ],
  "slotCount": 6,
  "gridSize": 10,
  "boards": [
    {
      "id": "b1",
      "prefab": "Board_Gear",
      "position": [
        0.30612413920462134,
        0,
        0.2619265877408906
      ],
      "rotation": [
        0,
        0,
        0
      ],
      "collapseType": "tween",
      "holes": [
        {
          "id": "h1",
          "pos": [
            -0.55,
            0,
            0.95
          ],
          "color": "green"
        },
        {
          "id": "h2",
          "pos": [
            0.55,
            0,
            -0.95
          ],
          "color": "green",
          "coveredBy": [
            "b7"
          ]
        },
        {
          "id": "h3",
          "pos": [
            -0.55,
            0,
            0
          ],
          "color": "green",
          "coveredBy": [
            "b6"
          ]
        },
        {
          "id": "h4",
          "pos": [
            1.1,
            0,
            0
          ],
          "color": "yellow",
          "coveredBy": [
            "b3",
            "b5",
            "b7",
            "b9"
          ]
        },
        {
          "id": "h5",
          "pos": [
            0.55,
            0,
            0.95
          ],
          "color": "blue",
          "coveredBy": [
            "b7"
          ]
        }
      ]
    },
    {
      "id": "b2",
      "prefab": "Board_L",
      "position": [
        -2.5897071428131313,
        1,
        0.2850253448821604
      ],
      "rotation": [
        0,
        0,
        0
      ],
      "collapseType": "tween",
      "holes": [
        {
          "id": "h1",
          "pos": [
            -1.4,
            0,
            -0.26
          ],
          "color": "red"
        },
        {
          "id": "h2",
          "pos": [
            -0.9,
            0,
            -1.1
          ],
          "color": "blue",
          "coveredBy": [
            "b8"
          ]
        },
        {
          "id": "h3",
          "pos": [
            0.7,
            0,
            -0.26
          ],
          "color": "green",
          "coveredBy": [
            "b4",
            "b6",
            "b8"
          ]
        },
        {
          "id": "h4",
          "pos": [
            -1.5,
            0,
            -1.1
          ],
          "color": "green"
        },
        {
          "id": "h5",
          "pos": [
            0.7,
            0,
            0.26
          ],
          "color": "red",
          "coveredBy": [
            "b6",
            "b8"
          ]
        }
      ]
    },
    {
      "id": "b3",
      "prefab": "Board_Single",
      "position": [
        2.323282790207304,
        1,
        -0.010951683134771906
      ],
      "rotation": [
        0,
        0,
        0
      ],
      "collapseType": "tween",
      "holes": [
        {
          "id": "h1",
          "pos": [
            0,
            0,
            -0.26
          ],
          "color": "yellow",
          "coveredBy": [
            "b5",
            "b7",
            "b9"
          ]
        },
        {
          "id": "h2",
          "pos": [
            0.7,
            0,
            0.26
          ],
          "color": "blue",
          "coveredBy": [
            "b5",
            "b7",
            "b9"
          ]
        },
        {
          "id": "h3",
          "pos": [
            0.7,
            0,
            -0.26
          ],
          "color": "purple",
          "coveredBy": [
            "b5",
            "b7",
            "b9"
          ]
        },
        {
          "id": "h4",
          "pos": [
            1.4,
            0,
            -0.26
          ],
          "color": "green",
          "coveredBy": [
            "b5",
            "b9"
          ]
        },
        {
          "id": "h5",
          "pos": [
            -1.4,
            0,
            -0.26
          ],
          "color": "yellow",
          "coveredBy": [
            "b5",
            "b7",
            "b9"
          ]
        }
      ]
    },
    {
      "id": "b4",
      "prefab": "Board_Single",
      "position": [
        -2.239066828694195,
        2,
        -0.14069445480126885
      ],
      "rotation": [
        0,
        0,
        0
      ],
      "collapseType": "tween",
      "holes": [
        {
          "id": "h1",
          "pos": [
            1.4,
            0,
            0.26
          ],
          "color": "yellow",
          "coveredBy": [
            "b6",
            "b8"
          ]
        },
        {
          "id": "h2",
          "pos": [
            0.7,
            0,
            -0.26
          ],
          "color": "blue",
          "coveredBy": [
            "b8"
          ]
        },
        {
          "id": "h3",
          "pos": [
            -0.7,
            0,
            0.26
          ],
          "color": "red",
          "coveredBy": [
            "b6",
            "b8"
          ]
        },
        {
          "id": "h4",
          "pos": [
            -0.7,
            0,
            -0.26
          ],
          "color": "blue",
          "coveredBy": [
            "b8"
          ]
        }
      ]
    },
    {
      "id": "b5",
      "prefab": "Board_Gear",
      "position": [
        2.380700221587904,
        2,
        -0.15900228777900338
      ],
      "rotation": [
        0,
        0,
        0
      ],
      "collapseType": "tween",
      "holes": [
        {
          "id": "h1",
          "pos": [
            0.55,
            0,
            0
          ],
          "color": "yellow",
          "coveredBy": [
            "b7",
            "b9"
          ]
        },
        {
          "id": "h2",
          "pos": [
            -0.55,
            0,
            0.95
          ],
          "color": "purple",
          "coveredBy": [
            "b7",
            "b9"
          ]
        },
        {
          "id": "h3",
          "pos": [
            0.55,
            0,
            -0.95
          ],
          "color": "blue",
          "coveredBy": [
            "b7"
          ]
        },
        {
          "id": "h4",
          "pos": [
            -0.55,
            0,
            0
          ],
          "color": "yellow",
          "coveredBy": [
            "b7",
            "b9"
          ]
        }
      ]
    },
    {
      "id": "b6",
      "prefab": "Board_Single",
      "position": [
        -1.8795457388740036,
        3,
        0.22200859033036976
      ],
      "rotation": [
        0,
        0,
        0
      ],
      "collapseType": "tween",
      "holes": [
        {
          "id": "h1",
          "pos": [
            0.7,
            0,
            -0.26
          ],
          "color": "red",
          "coveredBy": [
            "b8"
          ]
        },
        {
          "id": "h2",
          "pos": [
            0.7,
            0,
            0.26
          ],
          "color": "yellow",
          "coveredBy": [
            "b8"
          ]
        },
        {
          "id": "h3",
          "pos": [
            -0.7,
            0,
            0.26
          ],
          "color": "red",
          "coveredBy": [
            "b8"
          ]
        },
        {
          "id": "h4",
          "pos": [
            -1.4,
            0,
            0.26
          ],
          "color": "green",
          "coveredBy": [
            "b8"
          ]
        },
        {
          "id": "h5",
          "pos": [
            0,
            0,
            0.26
          ],
          "color": "red",
          "coveredBy": [
            "b8"
          ]
        }
      ]
    },
    {
      "id": "b7",
      "prefab": "Board_Gear",
      "position": [
        1.9151696032145995,
        3,
        -0.1771746376994997
      ],
      "rotation": [
        0,
        0,
        0
      ],
      "collapseType": "tween",
      "holes": [
        {
          "id": "h1",
          "pos": [
            0.55,
            0,
            0.95
          ],
          "color": "blue",
          "coveredBy": [
            "b9"
          ]
        },
        {
          "id": "h2",
          "pos": [
            -0.55,
            0,
            0.95
          ],
          "color": "blue",
          "coveredBy": [
            "b9"
          ]
        },
        {
          "id": "h3",
          "pos": [
            -1.1,
            0,
            0
          ],
          "color": "red"
        },
        {
          "id": "h4",
          "pos": [
            -0.55,
            0,
            0
          ],
          "color": "blue",
          "coveredBy": [
            "b9"
          ]
        },
        {
          "id": "h5",
          "pos": [
            0.55,
            0,
            0
          ],
          "color": "red",
          "coveredBy": [
            "b9"
          ]
        }
      ]
    },
    {
      "id": "b8",
      "prefab": "Board_Gear",
      "position": [
        -2.06875964102801,
        4,
        0.04425079717766495
      ],
      "rotation": [
        0,
        0,
        0
      ],
      "collapseType": "tween",
      "holes": [
        {
          "id": "h1",
          "pos": [
            -1.1,
            0,
            0
          ],
          "color": "purple"
        },
        {
          "id": "h2",
          "pos": [
            0.55,
            0,
            0.95
          ],
          "color": "purple"
        },
        {
          "id": "h3",
          "pos": [
            1.1,
            0,
            0
          ],
          "color": "purple"
        },
        {
          "id": "h4",
          "pos": [
            -0.55,
            0,
            -0.95
          ],
          "color": "yellow"
        }
      ]
    },
    {
      "id": "b9",
      "prefab": "Board_Gear",
      "position": [
        2.398743908153847,
        4,
        0.21865799517836415
      ],
      "rotation": [
        0,
        0,
        0
      ],
      "collapseType": "tween",
      "holes": [
        {
          "id": "h1",
          "pos": [
            -0.55,
            0,
            -0.95
          ],
          "color": "green"
        },
        {
          "id": "h2",
          "pos": [
            0.55,
            0,
            0
          ],
          "color": "red"
        },
        {
          "id": "h3",
          "pos": [
            -0.55,
            0,
            0.95
          ],
          "color": "green"
        },
        {
          "id": "h4",
          "pos": [
            1.1,
            0,
            0
          ],
          "color": "purple"
        },
        {
          "id": "h5",
          "pos": [
            0.55,
            0,
            -0.95
          ],
          "color": "yellow"
        }
      ]
    }
  ],
  "seed": 29002760
};
