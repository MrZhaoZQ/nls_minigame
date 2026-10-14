'use strict';

module.exports = {
  "id": 22,
  "name": "挑战 22",
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
        -0.11255018392112107,
        0,
        0.22029720328282565
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
          "color": "blue",
          "coveredBy": [
            "b3",
            "b5"
          ]
        },
        {
          "id": "h2",
          "pos": [
            0.7,
            0,
            0.26
          ],
          "color": "red",
          "coveredBy": [
            "b3",
            "b5",
            "b7"
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
            "b3",
            "b5",
            "b7"
          ]
        },
        {
          "id": "h4",
          "pos": [
            0,
            0,
            -0.26
          ],
          "color": "green"
        },
        {
          "id": "h5",
          "pos": [
            -0.9,
            0,
            -1.1
          ],
          "color": "blue",
          "coveredBy": [
            "b2",
            "b4",
            "b6"
          ]
        },
        {
          "id": "h6",
          "pos": [
            -0.7,
            0,
            0.26
          ],
          "color": "green",
          "coveredBy": [
            "b2",
            "b4",
            "b6"
          ]
        }
      ]
    },
    {
      "id": "b2",
      "prefab": "Board_Gear",
      "position": [
        -2.0211018185034164,
        1,
        -0.17922946903854609
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
            -1.1,
            0,
            0
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
            -0.55,
            0,
            0.95
          ],
          "color": "blue",
          "coveredBy": [
            "b4",
            "b6"
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
            "b4",
            "b6"
          ]
        },
        {
          "id": "h4",
          "pos": [
            0.55,
            0,
            -0.95
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
            1.1,
            0,
            0
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
        2.350388243714883,
        1,
        0.3259987355209887
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
            0.26
          ],
          "color": "blue",
          "coveredBy": [
            "b5",
            "b7"
          ]
        },
        {
          "id": "h2",
          "pos": [
            -1.4,
            0,
            0.26
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
          "color": "yellow",
          "coveredBy": [
            "b5",
            "b7"
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
            "b5"
          ]
        },
        {
          "id": "h6",
          "pos": [
            -1.4,
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
      "prefab": "Board_Gear",
      "position": [
        -2.018283347559117,
        2,
        0.16454810600262137
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
            -0.95
          ],
          "color": "yellow",
          "coveredBy": [
            "b6"
          ]
        },
        {
          "id": "h2",
          "pos": [
            0.55,
            0,
            0
          ],
          "color": "red",
          "coveredBy": [
            "b6"
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
          "color": "purple",
          "coveredBy": [
            "b6"
          ]
        },
        {
          "id": "h5",
          "pos": [
            -0.55,
            0,
            -0.95
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
        2.136704207427755,
        2,
        0.05866155298426745
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
            1.4,
            0,
            0.26
          ],
          "color": "purple"
        },
        {
          "id": "h2",
          "pos": [
            0,
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
          "color": "green"
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
            -0.9,
            0,
            -1.1
          ],
          "color": "blue"
        }
      ]
    },
    {
      "id": "b6",
      "prefab": "Board_Gear",
      "position": [
        -2.2912415900500496,
        3,
        -0.24000904257409272
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
            -0.55,
            0,
            -0.95
          ],
          "color": "purple"
        },
        {
          "id": "h3",
          "pos": [
            -0.55,
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
          "color": "yellow"
        },
        {
          "id": "h5",
          "pos": [
            -1.1,
            0,
            0
          ],
          "color": "blue"
        },
        {
          "id": "h6",
          "pos": [
            0.55,
            0,
            0
          ],
          "color": "red"
        }
      ]
    },
    {
      "id": "b7",
      "prefab": "Board_Single",
      "position": [
        2.2755652862135323,
        3,
        0.1879124637460336
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
          "color": "blue"
        },
        {
          "id": "h2",
          "pos": [
            -1.4,
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
          "color": "purple"
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
            -0.7,
            0,
            -0.26
          ],
          "color": "purple"
        },
        {
          "id": "h6",
          "pos": [
            0,
            0,
            0.26
          ],
          "color": "yellow"
        }
      ]
    }
  ],
  "seed": 22000576
};
