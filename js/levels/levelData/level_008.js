'use strict';

module.exports = {
  "id": 8,
  "name": "成长 8",
  "colors": [
    "red",
    "blue",
    "yellow",
    "green"
  ],
  "slotCount": 6,
  "gridSize": 10,
  "boards": [
    {
      "id": "b1",
      "prefab": "Board_Gear",
      "position": [
        0.05838948560412971,
        0,
        0.07740184387657789
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
          "color": "green",
          "coveredBy": [
            "b5"
          ]
        },
        {
          "id": "h2",
          "pos": [
            -0.55,
            0,
            -0.95
          ],
          "color": "red"
        },
        {
          "id": "h3",
          "pos": [
            1.1,
            0,
            0
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
          "id": "h5",
          "pos": [
            0.55,
            0,
            -0.95
          ],
          "color": "blue",
          "coveredBy": [
            "b5"
          ]
        },
        {
          "id": "h6",
          "pos": [
            0.55,
            0,
            0
          ],
          "color": "blue",
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
        -2.1938595759915187,
        1,
        0.013712131907232084
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
            0.26
          ],
          "color": "red"
        },
        {
          "id": "h2",
          "pos": [
            1.4,
            0,
            -0.26
          ],
          "color": "blue"
        },
        {
          "id": "h3",
          "pos": [
            -1.4,
            0,
            -0.26
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
          "color": "red",
          "coveredBy": [
            "b4"
          ]
        },
        {
          "id": "h5",
          "pos": [
            -0.7,
            0,
            0.26
          ],
          "color": "red"
        },
        {
          "id": "h6",
          "pos": [
            0,
            0,
            -0.26
          ],
          "color": "green",
          "coveredBy": [
            "b4"
          ]
        }
      ]
    },
    {
      "id": "b3",
      "prefab": "Board_Single",
      "position": [
        1.9976153828203678,
        1,
        0.18202453979756683
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
            0,
            0,
            -0.26
          ],
          "color": "blue",
          "coveredBy": [
            "b5"
          ]
        },
        {
          "id": "h2",
          "pos": [
            0.7,
            0,
            -0.26
          ],
          "color": "red",
          "coveredBy": [
            "b5"
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
            "b5"
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
            "b5"
          ]
        },
        {
          "id": "h5",
          "pos": [
            1.4,
            0,
            0.26
          ],
          "color": "green"
        },
        {
          "id": "h6",
          "pos": [
            -0.7,
            0,
            -0.26
          ],
          "color": "red",
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
        -2.4406224973951463,
        2,
        0.2182501235045492
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
          "color": "blue"
        },
        {
          "id": "h2",
          "pos": [
            0,
            0,
            0.26
          ],
          "color": "yellow"
        },
        {
          "id": "h3",
          "pos": [
            -1.4,
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
          "color": "yellow"
        },
        {
          "id": "h5",
          "pos": [
            1.4,
            0,
            -0.26
          ],
          "color": "yellow"
        },
        {
          "id": "h6",
          "pos": [
            1.4,
            0,
            0.26
          ],
          "color": "yellow"
        },
        {
          "id": "h7",
          "pos": [
            -1.4,
            0,
            0.26
          ],
          "color": "yellow"
        }
      ]
    },
    {
      "id": "b5",
      "prefab": "Board_Single",
      "position": [
        2.08959110954171,
        2,
        -0.08154323822818699
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
          "color": "yellow"
        },
        {
          "id": "h2",
          "pos": [
            0,
            0,
            -0.26
          ],
          "color": "green"
        },
        {
          "id": "h3",
          "pos": [
            0.7,
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
        }
      ]
    }
  ],
  "seed": 8000014
};
