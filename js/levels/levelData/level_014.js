'use strict';

module.exports = {
  "id": 14,
  "name": "成长 14",
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
        0.14886400660034266,
        0,
        -0.21349631412886083
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
          "color": "red",
          "coveredBy": [
            "b3"
          ]
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
            "b3"
          ]
        },
        {
          "id": "h3",
          "pos": [
            -1.1,
            0,
            0
          ],
          "color": "yellow",
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
            0
          ],
          "color": "red",
          "coveredBy": [
            "b3",
            "b5"
          ]
        },
        {
          "id": "h5",
          "pos": [
            -0.55,
            0,
            -0.95
          ],
          "color": "yellow",
          "coveredBy": [
            "b2"
          ]
        },
        {
          "id": "h6",
          "pos": [
            -0.55,
            0,
            0.95
          ],
          "color": "yellow",
          "coveredBy": [
            "b2"
          ]
        }
      ]
    },
    {
      "id": "b2",
      "prefab": "Board_L",
      "position": [
        -1.9221247140769844,
        1,
        -0.3278860383899882
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
          "color": "red"
        },
        {
          "id": "h2",
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
            -1.5,
            0,
            -1.1
          ],
          "color": "blue",
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
          "color": "red",
          "coveredBy": [
            "b4"
          ]
        },
        {
          "id": "h6",
          "pos": [
            0.7,
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
        2.110054462657775,
        1,
        -0.08593623356427998
      ],
      "rotation": [
        0,
        -40,
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
            "b5"
          ]
        },
        {
          "id": "h2",
          "pos": [
            1.4,
            0,
            0.26
          ],
          "color": "yellow"
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
            0.26
          ],
          "color": "blue",
          "coveredBy": [
            "b5"
          ]
        },
        {
          "id": "h5",
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
          "id": "h6",
          "pos": [
            0,
            0,
            -0.26
          ],
          "color": "red"
        },
        {
          "id": "h7",
          "pos": [
            -1.4,
            0,
            0.26
          ],
          "color": "blue"
        },
        {
          "id": "h8",
          "pos": [
            0.7,
            0,
            -0.26
          ],
          "color": "red"
        }
      ]
    },
    {
      "id": "b4",
      "prefab": "Board_Single",
      "position": [
        -2.271369342644233,
        2,
        -0.05606625967193396
      ],
      "rotation": [
        0,
        -40,
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
          "color": "yellow"
        },
        {
          "id": "h2",
          "pos": [
            0.7,
            0,
            0.26
          ],
          "color": "green"
        },
        {
          "id": "h3",
          "pos": [
            -1.4,
            0,
            0.26
          ],
          "color": "red"
        },
        {
          "id": "h4",
          "pos": [
            0,
            0,
            0.26
          ],
          "color": "red"
        },
        {
          "id": "h5",
          "pos": [
            0,
            0,
            -0.26
          ],
          "color": "yellow"
        },
        {
          "id": "h6",
          "pos": [
            -0.7,
            0,
            -0.26
          ],
          "color": "blue"
        }
      ]
    },
    {
      "id": "b5",
      "prefab": "Board_Single",
      "position": [
        2.3139226653599176,
        2,
        0.10648587623145428
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
          "color": "green"
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
          "color": "blue"
        },
        {
          "id": "h4",
          "pos": [
            0.7,
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
            -0.26
          ],
          "color": "yellow"
        },
        {
          "id": "h6",
          "pos": [
            0.7,
            0,
            -0.26
          ],
          "color": "blue"
        },
        {
          "id": "h7",
          "pos": [
            1.4,
            0,
            0.26
          ],
          "color": "green"
        }
      ]
    }
  ],
  "seed": 14000032
};
