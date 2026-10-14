'use strict';

module.exports = {
  "id": 11,
  "name": "成长 11",
  "colors": [
    "red",
    "blue",
    "yellow",
    "green"
  ],
  "slotCount": 5,
  "gridSize": 10,
  "boards": [
    {
      "id": "b1",
      "prefab": "Board_Gear",
      "position": [
        -0.16311787744052708,
        0,
        0.03349528666585683
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
          "color": "red",
          "coveredBy": [
            "b4"
          ]
        },
        {
          "id": "h2",
          "pos": [
            0.55,
            0,
            0
          ],
          "color": "green"
        },
        {
          "id": "h3",
          "pos": [
            -1.1,
            0,
            0
          ],
          "color": "red",
          "coveredBy": [
            "b2",
            "b4"
          ]
        },
        {
          "id": "h4",
          "pos": [
            0.55,
            0,
            0.95
          ],
          "color": "red"
        },
        {
          "id": "h5",
          "pos": [
            0.55,
            0,
            -0.95
          ],
          "color": "blue"
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
    },
    {
      "id": "b2",
      "prefab": "Board_L",
      "position": [
        -2.469117716955952,
        1,
        -0.21745809738058597
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
          "color": "red",
          "coveredBy": [
            "b4"
          ]
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
            "b4"
          ]
        },
        {
          "id": "h3",
          "pos": [
            -0.7,
            0,
            -0.26
          ],
          "color": "red",
          "coveredBy": [
            "b4"
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
            "b4"
          ]
        },
        {
          "id": "h5",
          "pos": [
            -1.4,
            0,
            0.26
          ],
          "color": "blue",
          "coveredBy": [
            "b4"
          ]
        },
        {
          "id": "h6",
          "pos": [
            -1.5,
            0,
            -1.1
          ],
          "color": "red"
        },
        {
          "id": "h7",
          "pos": [
            -0.9,
            0,
            -1.1
          ],
          "color": "blue"
        }
      ]
    },
    {
      "id": "b3",
      "prefab": "Board_L",
      "position": [
        2.1826404343824835,
        1,
        0.3359250311274081
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
          "color": "yellow",
          "coveredBy": [
            "b5"
          ]
        },
        {
          "id": "h2",
          "pos": [
            -0.7,
            0,
            0.26
          ],
          "color": "yellow",
          "coveredBy": [
            "b5"
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
            "b5"
          ]
        },
        {
          "id": "h4",
          "pos": [
            -0.9,
            0,
            -1.1
          ],
          "color": "red",
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
            "b5"
          ]
        },
        {
          "id": "h6",
          "pos": [
            -1.4,
            0,
            0.26
          ],
          "color": "blue",
          "coveredBy": [
            "b5"
          ]
        },
        {
          "id": "h7",
          "pos": [
            -0.7,
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
      "id": "b4",
      "prefab": "Board_Single",
      "position": [
        -2.3809967623460806,
        2,
        0.011605892144143592
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
            0.7,
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
          "color": "green"
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
            0,
            0,
            -0.26
          ],
          "color": "yellow"
        },
        {
          "id": "h5",
          "pos": [
            0,
            0,
            0.26
          ],
          "color": "green"
        },
        {
          "id": "h6",
          "pos": [
            1.4,
            0,
            0.26
          ],
          "color": "green"
        }
      ]
    },
    {
      "id": "b5",
      "prefab": "Board_Gear",
      "position": [
        2.085568630918465,
        2,
        -0.07892772918567059
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
          "color": "yellow"
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
            -0.55,
            0,
            -0.95
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
          "color": "yellow"
        },
        {
          "id": "h5",
          "pos": [
            0.55,
            0,
            -0.95
          ],
          "color": "green"
        },
        {
          "id": "h6",
          "pos": [
            1.1,
            0,
            0
          ],
          "color": "yellow"
        },
        {
          "id": "h7",
          "pos": [
            -0.55,
            0,
            0.95
          ],
          "color": "red"
        }
      ]
    }
  ],
  "seed": 11000159
};
