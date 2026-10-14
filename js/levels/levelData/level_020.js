'use strict';

module.exports = {
  "id": 20,
  "name": "挑战 20",
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
      "prefab": "Board_L",
      "position": [
        -0.2136829872149974,
        0,
        -0.2792323250323534
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
          "color": "blue",
          "coveredBy": [
            "b6"
          ]
        },
        {
          "id": "h2",
          "pos": [
            0,
            0,
            -0.26
          ],
          "color": "red",
          "coveredBy": [
            "b6"
          ]
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
            -0.7,
            0,
            0.26
          ],
          "color": "yellow",
          "coveredBy": [
            "b2",
            "b4",
            "b6"
          ]
        },
        {
          "id": "h5",
          "pos": [
            -1.5,
            0,
            -1.1
          ],
          "color": "green",
          "coveredBy": [
            "b6"
          ]
        }
      ]
    },
    {
      "id": "b2",
      "prefab": "Board_Single",
      "position": [
        -2.2747699380522364,
        1,
        0.05574113058391961
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
            -0.7,
            0,
            -0.26
          ],
          "color": "yellow",
          "coveredBy": [
            "b4",
            "b6"
          ]
        },
        {
          "id": "h2",
          "pos": [
            1.4,
            0,
            -0.26
          ],
          "color": "purple",
          "coveredBy": [
            "b4",
            "b6"
          ]
        },
        {
          "id": "h3",
          "pos": [
            1.4,
            0,
            0.26
          ],
          "color": "purple",
          "coveredBy": [
            "b4",
            "b6"
          ]
        },
        {
          "id": "h4",
          "pos": [
            0.7,
            0,
            0.26
          ],
          "color": "green",
          "coveredBy": [
            "b4",
            "b6"
          ]
        }
      ]
    },
    {
      "id": "b3",
      "prefab": "Board_Single",
      "position": [
        2.0133166981531074,
        1,
        -0.25187458975706245
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
            "b5",
            "b7"
          ]
        },
        {
          "id": "h2",
          "pos": [
            1.4,
            0,
            0.26
          ],
          "color": "red",
          "coveredBy": [
            "b5"
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
            "b5",
            "b7"
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
            "b7"
          ]
        },
        {
          "id": "h5",
          "pos": [
            0,
            0,
            -0.26
          ],
          "color": "blue",
          "coveredBy": [
            "b5",
            "b7"
          ]
        }
      ]
    },
    {
      "id": "b4",
      "prefab": "Board_Single",
      "position": [
        -2.446515236133314,
        2,
        0.2894424264319241
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
            0,
            0,
            -0.26
          ],
          "color": "yellow",
          "coveredBy": [
            "b6"
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
            "b6"
          ]
        },
        {
          "id": "h3",
          "pos": [
            1.4,
            0,
            0.26
          ],
          "color": "red",
          "coveredBy": [
            "b6"
          ]
        },
        {
          "id": "h4",
          "pos": [
            -1.4,
            0,
            0.26
          ],
          "color": "red",
          "coveredBy": [
            "b6"
          ]
        }
      ]
    },
    {
      "id": "b5",
      "prefab": "Board_L",
      "position": [
        2.3181667253045135,
        2,
        -0.23720725013408808
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
            -0.9,
            0,
            -1.1
          ],
          "color": "purple",
          "coveredBy": [
            "b7"
          ]
        },
        {
          "id": "h2",
          "pos": [
            1.4,
            0,
            0.26
          ],
          "color": "red"
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
            "b7"
          ]
        },
        {
          "id": "h4",
          "pos": [
            0.7,
            0,
            -0.26
          ],
          "color": "yellow",
          "coveredBy": [
            "b7"
          ]
        },
        {
          "id": "h5",
          "pos": [
            0,
            0,
            -0.26
          ],
          "color": "blue",
          "coveredBy": [
            "b7"
          ]
        }
      ]
    },
    {
      "id": "b6",
      "prefab": "Board_Gear",
      "position": [
        -1.7511458506574857,
        3,
        -0.34712371134664866
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
            -0.95
          ],
          "color": "red"
        },
        {
          "id": "h2",
          "pos": [
            0.55,
            0,
            0.95
          ],
          "color": "blue"
        },
        {
          "id": "h3",
          "pos": [
            0.55,
            0,
            0
          ],
          "color": "purple"
        },
        {
          "id": "h4",
          "pos": [
            -1.1,
            0,
            0
          ],
          "color": "green"
        }
      ]
    },
    {
      "id": "b7",
      "prefab": "Board_Gear",
      "position": [
        1.9058392229489984,
        3,
        -0.20701187595259396
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
          "color": "blue"
        },
        {
          "id": "h2",
          "pos": [
            -1.1,
            0,
            0
          ],
          "color": "green"
        },
        {
          "id": "h3",
          "pos": [
            0.55,
            0,
            -0.95
          ],
          "color": "blue"
        },
        {
          "id": "h4",
          "pos": [
            -0.55,
            0,
            -0.95
          ],
          "color": "purple"
        },
        {
          "id": "h5",
          "pos": [
            1.1,
            0,
            0
          ],
          "color": "purple"
        },
        {
          "id": "h6",
          "pos": [
            -0.55,
            0,
            0
          ],
          "color": "yellow"
        }
      ]
    }
  ],
  "seed": 20001009
};
