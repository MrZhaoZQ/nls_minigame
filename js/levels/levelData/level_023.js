'use strict';

module.exports = {
  "id": 23,
  "name": "挑战 23",
  "colors": [
    "red",
    "blue",
    "yellow",
    "green",
    "purple"
  ],
  "slotCount": 6,
  "gridSize": 16,
  "boards": [
    {
      "id": "b1",
      "prefab": "Board_Single",
      "position": [
        -2.2278373336652293,
        0,
        0.1246495742816478
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
          "color": "red",
          "coveredBy": [
            "b3",
            "b6",
            "b8"
          ]
        },
        {
          "id": "h2",
          "pos": [
            -1.4,
            0,
            0.26
          ],
          "color": "purple",
          "coveredBy": [
            "b3",
            "b5"
          ]
        },
        {
          "id": "h3",
          "pos": [
            0,
            0,
            -0.26
          ],
          "color": "yellow",
          "coveredBy": [
            "b3",
            "b8"
          ]
        },
        {
          "id": "h4",
          "pos": [
            0.7,
            0,
            -0.26
          ],
          "color": "blue",
          "coveredBy": [
            "b3",
            "b6",
            "b8"
          ]
        }
      ]
    },
    {
      "id": "b2",
      "prefab": "Board_Single",
      "position": [
        2.2938762731384488,
        0,
        0.24774406137876215
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
          "color": "red",
          "coveredBy": [
            "b4"
          ]
        },
        {
          "id": "h2",
          "pos": [
            0.7,
            0,
            -0.26
          ],
          "color": "yellow",
          "coveredBy": [
            "b4"
          ]
        },
        {
          "id": "h3",
          "pos": [
            1.4,
            0,
            -0.26
          ],
          "color": "yellow",
          "coveredBy": [
            "b4",
            "b7"
          ]
        },
        {
          "id": "h4",
          "pos": [
            -1.4,
            0,
            -0.26
          ],
          "color": "blue",
          "coveredBy": [
            "b4",
            "b6",
            "b9"
          ]
        }
      ]
    },
    {
      "id": "b3",
      "prefab": "Board_Single",
      "position": [
        -2.156943806715379,
        1,
        -0.3123186107259244
      ],
      "rotation": [
        0,
        20,
        0
      ],
      "collapseType": "tween",
      "holes": [
        {
          "id": "h1",
          "pos": [
            -0.7,
            0,
            0.26
          ],
          "color": "blue",
          "coveredBy": [
            "b8"
          ]
        },
        {
          "id": "h2",
          "pos": [
            -1.4,
            0,
            -0.26
          ],
          "color": "purple",
          "coveredBy": [
            "b5"
          ]
        },
        {
          "id": "h3",
          "pos": [
            0.7,
            0,
            -0.26
          ],
          "color": "blue",
          "coveredBy": [
            "b6",
            "b8"
          ]
        },
        {
          "id": "h4",
          "pos": [
            1.4,
            0,
            -0.26
          ],
          "color": "yellow",
          "coveredBy": [
            "b6",
            "b8"
          ]
        }
      ]
    },
    {
      "id": "b4",
      "prefab": "Board_Single",
      "position": [
        2.3505472649010595,
        1,
        0.2561312157427892
      ],
      "rotation": [
        0,
        40,
        0
      ],
      "collapseType": "tween",
      "holes": [
        {
          "id": "h1",
          "pos": [
            0,
            0,
            0.26
          ],
          "color": "purple",
          "coveredBy": [
            "b9"
          ]
        },
        {
          "id": "h2",
          "pos": [
            -0.7,
            0,
            -0.26
          ],
          "color": "green",
          "coveredBy": [
            "b9"
          ]
        },
        {
          "id": "h3",
          "pos": [
            0,
            0,
            -0.26
          ],
          "color": "green"
        },
        {
          "id": "h4",
          "pos": [
            -0.7,
            0,
            0.26
          ],
          "color": "yellow",
          "coveredBy": [
            "b6",
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
          "color": "red",
          "coveredBy": [
            "b6",
            "b9"
          ]
        }
      ]
    },
    {
      "id": "b5",
      "prefab": "Board_L",
      "position": [
        -4.853322097148041,
        2,
        -0.34001667702104893
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
            -1.5,
            0,
            -1.1
          ],
          "color": "blue"
        },
        {
          "id": "h2",
          "pos": [
            1.4,
            0,
            -0.26
          ],
          "color": "purple"
        },
        {
          "id": "h3",
          "pos": [
            1.4,
            0,
            0.26
          ],
          "color": "red"
        },
        {
          "id": "h4",
          "pos": [
            0.7,
            0,
            0.26
          ],
          "color": "yellow"
        }
      ]
    },
    {
      "id": "b6",
      "prefab": "Board_L",
      "position": [
        -0.09106193196494078,
        2,
        -0.2799026996828615
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
            1.4,
            0,
            -0.26
          ],
          "color": "yellow",
          "coveredBy": [
            "b9"
          ]
        },
        {
          "id": "h2",
          "pos": [
            -1.5,
            0,
            -1.1
          ],
          "color": "purple",
          "coveredBy": [
            "b8"
          ]
        },
        {
          "id": "h3",
          "pos": [
            0,
            0,
            -0.26
          ],
          "color": "blue"
        },
        {
          "id": "h4",
          "pos": [
            0,
            0,
            0.26
          ],
          "color": "green"
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
    },
    {
      "id": "b7",
      "prefab": "Board_Gear",
      "position": [
        5.095253788704279,
        2,
        0.23128045902121808
      ],
      "rotation": [
        0,
        -80,
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
          "color": "yellow"
        },
        {
          "id": "h2",
          "pos": [
            0.55,
            0,
            0.95
          ],
          "color": "red"
        },
        {
          "id": "h3",
          "pos": [
            -1.1,
            0,
            0
          ],
          "color": "yellow"
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
            -0.55,
            0,
            -0.95
          ],
          "color": "green"
        }
      ]
    },
    {
      "id": "b8",
      "prefab": "Board_Single",
      "position": [
        -1.672390869492665,
        3,
        -0.011659310292452596
      ],
      "rotation": [
        0,
        60,
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
          "color": "blue"
        },
        {
          "id": "h2",
          "pos": [
            0,
            0,
            0.26
          ],
          "color": "blue"
        },
        {
          "id": "h3",
          "pos": [
            1.4,
            0,
            0.26
          ],
          "color": "green"
        },
        {
          "id": "h4",
          "pos": [
            0.7,
            0,
            -0.26
          ],
          "color": "red"
        },
        {
          "id": "h5",
          "pos": [
            0.7,
            0,
            0.26
          ],
          "color": "red"
        }
      ]
    },
    {
      "id": "b9",
      "prefab": "Board_Single",
      "position": [
        1.6320753829786554,
        3,
        0.1201275431085378
      ],
      "rotation": [
        0,
        80,
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
          "color": "red"
        },
        {
          "id": "h2",
          "pos": [
            0,
            0,
            -0.26
          ],
          "color": "red"
        },
        {
          "id": "h3",
          "pos": [
            1.4,
            0,
            -0.26
          ],
          "color": "green"
        }
      ]
    }
  ],
  "seed": 23000381
};
