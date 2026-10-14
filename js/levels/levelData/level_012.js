'use strict';

module.exports = {
  "id": 12,
  "name": "成长 12",
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
        -1.9158929693279791,
        0,
        -0.20278215021826326
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
          "color": "yellow",
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
          "color": "blue",
          "coveredBy": [
            "b3"
          ]
        },
        {
          "id": "h3",
          "pos": [
            0.55,
            0,
            0.95
          ],
          "color": "green",
          "coveredBy": [
            "b3"
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
            "b5"
          ]
        },
        {
          "id": "h5",
          "pos": [
            0.55,
            0,
            0
          ],
          "color": "blue",
          "coveredBy": [
            "b3",
            "b5"
          ]
        }
      ]
    },
    {
      "id": "b2",
      "prefab": "Board_L",
      "position": [
        2.428015615209006,
        0,
        -0.02033651964738964
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
          "color": "blue",
          "coveredBy": [
            "b4",
            "b6"
          ]
        },
        {
          "id": "h2",
          "pos": [
            -1.4,
            0,
            0.26
          ],
          "color": "red",
          "coveredBy": [
            "b4"
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
            "b4",
            "b6"
          ]
        },
        {
          "id": "h4",
          "pos": [
            0.7,
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
      "prefab": "Board_L",
      "position": [
        -2.4813664638485333,
        1,
        -0.07673808219842615
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
            -1.5,
            0,
            -1.1
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
          "color": "blue",
          "coveredBy": [
            "b5"
          ]
        },
        {
          "id": "h3",
          "pos": [
            -1.4,
            0,
            -0.26
          ],
          "color": "yellow"
        },
        {
          "id": "h4",
          "pos": [
            1.4,
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
            -0.26
          ],
          "color": "green",
          "coveredBy": [
            "b5"
          ]
        },
        {
          "id": "h6",
          "pos": [
            -0.7,
            0,
            -0.26
          ],
          "color": "blue",
          "coveredBy": [
            "b5"
          ]
        }
      ]
    },
    {
      "id": "b4",
      "prefab": "Board_Gear",
      "position": [
        2.774585015331539,
        1,
        0.236653409502469
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
            -0.55,
            0,
            0
          ],
          "color": "red",
          "coveredBy": [
            "b6"
          ]
        },
        {
          "id": "h2",
          "pos": [
            1.1,
            0,
            0
          ],
          "color": "blue",
          "coveredBy": [
            "b6"
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
            0.55,
            0,
            0
          ],
          "color": "blue",
          "coveredBy": [
            "b6"
          ]
        }
      ]
    },
    {
      "id": "b5",
      "prefab": "Board_Single",
      "position": [
        -2.106190086062998,
        2,
        -0.2989206897793337
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
          "color": "green"
        },
        {
          "id": "h2",
          "pos": [
            -0.7,
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
          "color": "blue"
        },
        {
          "id": "h4",
          "pos": [
            0.7,
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
            -0.26
          ],
          "color": "green"
        }
      ]
    },
    {
      "id": "b6",
      "prefab": "Board_Gear",
      "position": [
        2.3693581696832555,
        2,
        -0.3020074394764378
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
          "color": "red"
        },
        {
          "id": "h2",
          "pos": [
            -0.55,
            0,
            -0.95
          ],
          "color": "green"
        },
        {
          "id": "h3",
          "pos": [
            -0.55,
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
            0.95
          ],
          "color": "blue"
        },
        {
          "id": "h5",
          "pos": [
            0.55,
            0,
            0
          ],
          "color": "red"
        },
        {
          "id": "h6",
          "pos": [
            0.55,
            0,
            -0.95
          ],
          "color": "red"
        }
      ]
    }
  ],
  "seed": 12000023
};
