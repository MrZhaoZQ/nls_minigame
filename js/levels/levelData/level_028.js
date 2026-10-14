'use strict';

module.exports = {
  "id": 28,
  "name": "大师 28",
  "colors": [
    "red",
    "blue",
    "yellow",
    "green",
    "purple"
  ],
  "slotCount": 6,
  "gridSize": 14,
  "boards": [
    {
      "id": "b1",
      "prefab": "Board_Single",
      "position": [
        -2.320044078847349,
        0,
        0.05912071850616485
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
          "color": "purple",
          "coveredBy": [
            "b3",
            "b6",
            "b8"
          ]
        },
        {
          "id": "h2",
          "pos": [
            0,
            0,
            0.26
          ],
          "color": "red",
          "coveredBy": [
            "b3",
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
          "color": "red",
          "coveredBy": [
            "b3",
            "b8"
          ]
        },
        {
          "id": "h4",
          "pos": [
            -0.7,
            0,
            0.26
          ],
          "color": "blue",
          "coveredBy": [
            "b3",
            "b5",
            "b8"
          ]
        },
        {
          "id": "h5",
          "pos": [
            1.4,
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
        1.977713911917016,
        0,
        -0.06719658612273632
      ],
      "rotation": [
        0,
        -60,
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
          "color": "green"
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
            "b9"
          ]
        },
        {
          "id": "h3",
          "pos": [
            0,
            0,
            0.26
          ],
          "color": "blue",
          "coveredBy": [
            "b4",
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
          "color": "red"
        },
        {
          "id": "h5",
          "pos": [
            1.4,
            0,
            0.26
          ],
          "color": "blue",
          "coveredBy": [
            "b7"
          ]
        },
        {
          "id": "h6",
          "pos": [
            -1.4,
            0,
            0.26
          ],
          "color": "red"
        }
      ]
    },
    {
      "id": "b3",
      "prefab": "Board_Single",
      "position": [
        -2.196907880110666,
        1,
        -0.08989521793555466
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
            1.4,
            0,
            -0.26
          ],
          "color": "yellow",
          "coveredBy": [
            "b6"
          ]
        },
        {
          "id": "h3",
          "pos": [
            -0.7,
            0,
            -0.26
          ],
          "color": "blue",
          "coveredBy": [
            "b8"
          ]
        },
        {
          "id": "h4",
          "pos": [
            0,
            0,
            -0.26
          ],
          "color": "purple",
          "coveredBy": [
            "b8"
          ]
        }
      ]
    },
    {
      "id": "b4",
      "prefab": "Board_Single",
      "position": [
        2.236680271523073,
        1,
        0.16645197381731122
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
          "color": "purple",
          "coveredBy": [
            "b6",
            "b9"
          ]
        },
        {
          "id": "h2",
          "pos": [
            1.4,
            0,
            0.26
          ],
          "color": "yellow",
          "coveredBy": [
            "b7"
          ]
        },
        {
          "id": "h3",
          "pos": [
            -1.4,
            0,
            -0.26
          ],
          "color": "yellow",
          "coveredBy": [
            "b6",
            "b9"
          ]
        },
        {
          "id": "h4",
          "pos": [
            -0.7,
            0,
            0.26
          ],
          "color": "green",
          "coveredBy": [
            "b6",
            "b9"
          ]
        }
      ]
    },
    {
      "id": "b5",
      "prefab": "Board_Single",
      "position": [
        -4.3032850605267585,
        2,
        -0.10520770365837961
      ],
      "rotation": [
        0,
        -60,
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
          "color": "purple"
        },
        {
          "id": "h2",
          "pos": [
            -1.4,
            0,
            0.26
          ],
          "color": "green"
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
            -0.7,
            0,
            0.26
          ],
          "color": "purple"
        },
        {
          "id": "h5",
          "pos": [
            -1.4,
            0,
            -0.26
          ],
          "color": "red"
        }
      ]
    },
    {
      "id": "b6",
      "prefab": "Board_Single",
      "position": [
        -0.048236464818984526,
        2,
        0.019312303466722358
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
            "b9"
          ]
        },
        {
          "id": "h2",
          "pos": [
            -0.7,
            0,
            0.26
          ],
          "color": "green",
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
          "color": "yellow",
          "coveredBy": [
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
            "b9"
          ]
        }
      ]
    },
    {
      "id": "b7",
      "prefab": "Board_Gear",
      "position": [
        4.288434833876744,
        2,
        -0.323012409126386
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
            1.1,
            0,
            0
          ],
          "color": "green"
        },
        {
          "id": "h2",
          "pos": [
            -0.55,
            0,
            -0.95
          ],
          "color": "yellow"
        },
        {
          "id": "h3",
          "pos": [
            0.55,
            0,
            0.95
          ],
          "color": "red"
        },
        {
          "id": "h4",
          "pos": [
            0.55,
            0,
            -0.95
          ],
          "color": "yellow"
        }
      ]
    },
    {
      "id": "b8",
      "prefab": "Board_Single",
      "position": [
        -2.2881126230349764,
        3,
        0.04418206447735429
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
          "color": "yellow"
        },
        {
          "id": "h2",
          "pos": [
            0.7,
            0,
            -0.26
          ],
          "color": "green"
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
            0,
            0,
            -0.26
          ],
          "color": "purple"
        },
        {
          "id": "h5",
          "pos": [
            -0.7,
            0,
            -0.26
          ],
          "color": "red"
        }
      ]
    },
    {
      "id": "b9",
      "prefab": "Board_Single",
      "position": [
        2.075442391796969,
        3,
        -0.10840457095764577
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
          "color": "red"
        },
        {
          "id": "h2",
          "pos": [
            -0.7,
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
            -1.4,
            0,
            -0.26
          ],
          "color": "green"
        },
        {
          "id": "h5",
          "pos": [
            1.4,
            0,
            -0.26
          ],
          "color": "red"
        }
      ]
    }
  ],
  "seed": 28006159
};
