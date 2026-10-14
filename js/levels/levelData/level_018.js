'use strict';

module.exports = {
  "id": 18,
  "name": "挑战 18",
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
        0.2164419738808646,
        0,
        0.10549424134660512
      ],
      "rotation": [
        0,
        90,
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
            "b5"
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
            -1.4,
            0,
            0.26
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
          "color": "blue",
          "coveredBy": [
            "b3",
            "b5"
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
            "b5"
          ]
        },
        {
          "id": "h6",
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
      "id": "b2",
      "prefab": "Board_Single",
      "position": [
        -1.9415660037891938,
        1,
        0.15065703007858244
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
            -1.4,
            0,
            0.26
          ],
          "color": "yellow"
        },
        {
          "id": "h2",
          "pos": [
            1.4,
            0,
            0.26
          ],
          "color": "blue"
        },
        {
          "id": "h3",
          "pos": [
            0.7,
            0,
            0.26
          ],
          "color": "red"
        },
        {
          "id": "h4",
          "pos": [
            -0.7,
            0,
            0.26
          ],
          "color": "green"
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
      "id": "b3",
      "prefab": "Board_Single",
      "position": [
        1.6092125374125317,
        1,
        0.06378793388139459
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
            "b5",
            "b7"
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
            "b5",
            "b7"
          ]
        },
        {
          "id": "h3",
          "pos": [
            0,
            0,
            -0.26
          ],
          "color": "purple",
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
            -0.26
          ],
          "color": "purple",
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
      "prefab": "Board_Single",
      "position": [
        -2.0046159055316823,
        2,
        0.26640476842876526
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
            0.26
          ],
          "color": "blue",
          "coveredBy": [
            "b6"
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
            "b6"
          ]
        },
        {
          "id": "h3",
          "pos": [
            0.7,
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
            1.4,
            0,
            0.26
          ],
          "color": "purple"
        },
        {
          "id": "h5",
          "pos": [
            0,
            0,
            0.26
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
      "prefab": "Board_Gear",
      "position": [
        1.9585396326612685,
        2,
        0.1256230571074411
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
          "color": "green",
          "coveredBy": [
            "b7"
          ]
        },
        {
          "id": "h2",
          "pos": [
            0.55,
            0,
            -0.95
          ],
          "color": "red",
          "coveredBy": [
            "b7"
          ]
        },
        {
          "id": "h3",
          "pos": [
            0.55,
            0,
            0
          ],
          "color": "green",
          "coveredBy": [
            "b7"
          ]
        },
        {
          "id": "h4",
          "pos": [
            -0.55,
            0,
            0.95
          ],
          "color": "green",
          "coveredBy": [
            "b7"
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
            "b7"
          ]
        },
        {
          "id": "h6",
          "pos": [
            -1.1,
            0,
            0
          ],
          "color": "red",
          "coveredBy": [
            "b7"
          ]
        }
      ]
    },
    {
      "id": "b6",
      "prefab": "Board_Single",
      "position": [
        -2.3420863884333074,
        3,
        0.13732252032496034
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
          "color": "red"
        },
        {
          "id": "h3",
          "pos": [
            -0.7,
            0,
            0.26
          ],
          "color": "purple"
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
            0.26
          ],
          "color": "purple"
        }
      ]
    },
    {
      "id": "b7",
      "prefab": "Board_Single",
      "position": [
        1.8635408459063174,
        3,
        -0.12036844061221924
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
          "color": "yellow"
        },
        {
          "id": "h2",
          "pos": [
            -0.7,
            0,
            -0.26
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
          "color": "purple"
        },
        {
          "id": "h4",
          "pos": [
            -1.4,
            0,
            -0.26
          ],
          "color": "green"
        }
      ]
    }
  ],
  "seed": 18000197
};
