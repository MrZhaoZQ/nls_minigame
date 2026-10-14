'use strict';

module.exports = {
  "id": 17,
  "name": "挑战 17",
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
        -2.17438721426297,
        0,
        -0.0937327633611858
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
            "b3"
          ]
        },
        {
          "id": "h2",
          "pos": [
            -0.7,
            0,
            -0.26
          ],
          "color": "blue",
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
          "color": "blue",
          "coveredBy": [
            "b3",
            "b5"
          ]
        },
        {
          "id": "h4",
          "pos": [
            0.7,
            0,
            -0.26
          ],
          "color": "green",
          "coveredBy": [
            "b5"
          ]
        },
        {
          "id": "h5",
          "pos": [
            0.7,
            0,
            0.26
          ],
          "color": "blue",
          "coveredBy": [
            "b3",
            "b5"
          ]
        },
        {
          "id": "h6",
          "pos": [
            0,
            0,
            -0.26
          ],
          "color": "yellow",
          "coveredBy": [
            "b5"
          ]
        }
      ]
    },
    {
      "id": "b2",
      "prefab": "Board_Single",
      "position": [
        2.5963520023273303,
        0,
        -0.16944168810732663
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
            "b6"
          ]
        },
        {
          "id": "h2",
          "pos": [
            1.4,
            0,
            0.26
          ],
          "color": "purple"
        },
        {
          "id": "h3",
          "pos": [
            1.4,
            0,
            -0.26
          ],
          "color": "yellow"
        },
        {
          "id": "h4",
          "pos": [
            -0.7,
            0,
            -0.26
          ],
          "color": "red",
          "coveredBy": [
            "b4",
            "b6"
          ]
        },
        {
          "id": "h5",
          "pos": [
            -0.7,
            0,
            0.26
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
            -1.4,
            0,
            -0.26
          ],
          "color": "red",
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
        -2.081772167305462,
        1,
        0.31960545922629535
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
          "color": "green",
          "coveredBy": [
            "b5"
          ]
        },
        {
          "id": "h2",
          "pos": [
            -1.4,
            0,
            -0.26
          ],
          "color": "green",
          "coveredBy": [
            "b5"
          ]
        },
        {
          "id": "h3",
          "pos": [
            -0.7,
            0,
            -0.26
          ],
          "color": "yellow",
          "coveredBy": [
            "b5"
          ]
        },
        {
          "id": "h4",
          "pos": [
            1.4,
            0,
            0.26
          ],
          "color": "yellow"
        },
        {
          "id": "h5",
          "pos": [
            -0.7,
            0,
            0.26
          ],
          "color": "purple"
        },
        {
          "id": "h6",
          "pos": [
            -1.4,
            0,
            0.26
          ],
          "color": "red"
        },
        {
          "id": "h7",
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
      "id": "b4",
      "prefab": "Board_Single",
      "position": [
        1.9694579438539221,
        1,
        0.13146666802931575
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
            1.4,
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
          "color": "blue",
          "coveredBy": [
            "b6"
          ]
        },
        {
          "id": "h3",
          "pos": [
            0,
            0,
            -0.26
          ],
          "color": "green",
          "coveredBy": [
            "b6"
          ]
        },
        {
          "id": "h4",
          "pos": [
            -0.7,
            0,
            0.26
          ],
          "color": "red",
          "coveredBy": [
            "b6"
          ]
        },
        {
          "id": "h5",
          "pos": [
            -1.4,
            0,
            -0.26
          ],
          "color": "green"
        }
      ]
    },
    {
      "id": "b5",
      "prefab": "Board_Single",
      "position": [
        -2.561340936017223,
        2,
        -0.0032486284151673206
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
            0.26
          ],
          "color": "purple"
        },
        {
          "id": "h2",
          "pos": [
            -0.7,
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
          "color": "blue"
        },
        {
          "id": "h4",
          "pos": [
            0.7,
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
        },
        {
          "id": "h6",
          "pos": [
            -0.7,
            0,
            0.26
          ],
          "color": "purple"
        }
      ]
    },
    {
      "id": "b6",
      "prefab": "Board_Single",
      "position": [
        2.259429228911176,
        2,
        -0.33274412036407736
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
          "color": "blue"
        },
        {
          "id": "h2",
          "pos": [
            -1.4,
            0,
            0.26
          ],
          "color": "red"
        },
        {
          "id": "h3",
          "pos": [
            0.7,
            0,
            0.26
          ],
          "color": "blue"
        },
        {
          "id": "h4",
          "pos": [
            0.7,
            0,
            -0.26
          ],
          "color": "blue"
        },
        {
          "id": "h5",
          "pos": [
            -1.4,
            0,
            -0.26
          ],
          "color": "red"
        },
        {
          "id": "h6",
          "pos": [
            0,
            0,
            0.26
          ],
          "color": "green"
        }
      ]
    }
  ],
  "seed": 17001311
};
