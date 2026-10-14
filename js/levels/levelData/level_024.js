'use strict';

module.exports = {
  "id": 24,
  "name": "挑战 24",
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
      "prefab": "Board_Single",
      "position": [
        0.23321950507815925,
        0,
        0.23185051989275962
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
            -0.7,
            0,
            -0.26
          ],
          "color": "yellow"
        },
        {
          "id": "h2",
          "pos": [
            0,
            0,
            -0.26
          ],
          "color": "yellow",
          "coveredBy": [
            "b3"
          ]
        },
        {
          "id": "h3",
          "pos": [
            0.7,
            0,
            0.26
          ],
          "color": "green",
          "coveredBy": [
            "b3",
            "b5",
            "b7"
          ]
        },
        {
          "id": "h4",
          "pos": [
            1.4,
            0,
            0.26
          ],
          "color": "purple",
          "coveredBy": [
            "b3",
            "b5",
            "b7"
          ]
        },
        {
          "id": "h5",
          "pos": [
            1.4,
            0,
            -0.26
          ],
          "color": "yellow",
          "coveredBy": [
            "b3",
            "b5",
            "b7"
          ]
        },
        {
          "id": "h6",
          "pos": [
            0,
            0,
            0.26
          ],
          "color": "green",
          "coveredBy": [
            "b3"
          ]
        }
      ]
    },
    {
      "id": "b2",
      "prefab": "Board_Gear",
      "position": [
        -2.0871001873165373,
        1,
        0.33441544217057523
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
          "color": "yellow"
        },
        {
          "id": "h2",
          "pos": [
            0.55,
            0,
            0.95
          ],
          "color": "yellow"
        },
        {
          "id": "h3",
          "pos": [
            1.1,
            0,
            0
          ],
          "color": "red",
          "coveredBy": [
            "b4",
            "b6"
          ]
        },
        {
          "id": "h4",
          "pos": [
            -0.55,
            0,
            -0.95
          ],
          "color": "red",
          "coveredBy": [
            "b4"
          ]
        },
        {
          "id": "h5",
          "pos": [
            -0.55,
            0,
            0
          ],
          "color": "red",
          "coveredBy": [
            "b4",
            "b6"
          ]
        },
        {
          "id": "h6",
          "pos": [
            0.55,
            0,
            -0.95
          ],
          "color": "blue",
          "coveredBy": [
            "b4"
          ]
        }
      ]
    },
    {
      "id": "b3",
      "prefab": "Board_Gear",
      "position": [
        1.752264507254586,
        1,
        0.3489382971078157
      ],
      "rotation": [
        0,
        -20,
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
          "color": "purple",
          "coveredBy": [
            "b5"
          ]
        },
        {
          "id": "h2",
          "pos": [
            -0.55,
            0,
            0
          ],
          "color": "purple",
          "coveredBy": [
            "b5",
            "b7"
          ]
        },
        {
          "id": "h3",
          "pos": [
            -1.1,
            0,
            0
          ],
          "color": "blue",
          "coveredBy": [
            "b5",
            "b7"
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
            "b5",
            "b7"
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
            "b5",
            "b7"
          ]
        }
      ]
    },
    {
      "id": "b4",
      "prefab": "Board_Gear",
      "position": [
        -2.201807586872019,
        2,
        -0.33157669336069373
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
          "color": "green"
        },
        {
          "id": "h2",
          "pos": [
            0.55,
            0,
            0.95
          ],
          "color": "green",
          "coveredBy": [
            "b6"
          ]
        },
        {
          "id": "h3",
          "pos": [
            -0.55,
            0,
            -0.95
          ],
          "color": "blue"
        },
        {
          "id": "h4",
          "pos": [
            0.55,
            0,
            0
          ],
          "color": "red"
        },
        {
          "id": "h5",
          "pos": [
            -0.55,
            0,
            0
          ],
          "color": "green"
        },
        {
          "id": "h6",
          "pos": [
            0.55,
            0,
            -0.95
          ],
          "color": "purple"
        }
      ]
    },
    {
      "id": "b5",
      "prefab": "Board_Gear",
      "position": [
        1.9786885897396136,
        2,
        0.21210997989401215
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
          "color": "yellow"
        },
        {
          "id": "h2",
          "pos": [
            0.55,
            0,
            0
          ],
          "color": "purple",
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
          "color": "blue",
          "coveredBy": [
            "b7"
          ]
        },
        {
          "id": "h4",
          "pos": [
            -1.1,
            0,
            0
          ],
          "color": "red",
          "coveredBy": [
            "b7"
          ]
        },
        {
          "id": "h5",
          "pos": [
            0.55,
            0,
            -0.95
          ],
          "color": "yellow"
        },
        {
          "id": "h6",
          "pos": [
            -0.55,
            0,
            0.95
          ],
          "color": "green"
        }
      ]
    },
    {
      "id": "b6",
      "prefab": "Board_Single",
      "position": [
        -2.2639394202968104,
        3,
        0.25363445694092657
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
            0.26
          ],
          "color": "red"
        },
        {
          "id": "h2",
          "pos": [
            0,
            0,
            -0.26
          ],
          "color": "blue"
        },
        {
          "id": "h3",
          "pos": [
            1.4,
            0,
            -0.26
          ],
          "color": "blue"
        },
        {
          "id": "h4",
          "pos": [
            -0.7,
            0,
            -0.26
          ],
          "color": "red"
        },
        {
          "id": "h5",
          "pos": [
            -1.4,
            0,
            -0.26
          ],
          "color": "yellow"
        }
      ]
    },
    {
      "id": "b7",
      "prefab": "Board_Single",
      "position": [
        2.258759342553094,
        3,
        0.2858240630244836
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
            0.26
          ],
          "color": "red"
        },
        {
          "id": "h2",
          "pos": [
            0,
            0,
            -0.26
          ],
          "color": "purple"
        },
        {
          "id": "h3",
          "pos": [
            -1.4,
            0,
            0.26
          ],
          "color": "blue"
        },
        {
          "id": "h4",
          "pos": [
            -0.7,
            0,
            0.26
          ],
          "color": "blue"
        },
        {
          "id": "h5",
          "pos": [
            0.7,
            0,
            -0.26
          ],
          "color": "blue"
        }
      ]
    }
  ],
  "seed": 24000053
};
