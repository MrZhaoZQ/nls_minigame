'use strict';

module.exports = {
  "id": 30,
  "name": "大师 30",
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
        -1.6206211753888056,
        0,
        0.224747836519964
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
            "b3",
            "b8",
            "b10"
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
            "b6",
            "b10"
          ]
        },
        {
          "id": "h3",
          "pos": [
            -1.4,
            0,
            0.26
          ],
          "color": "blue",
          "coveredBy": [
            "b3",
            "b8",
            "b10"
          ]
        }
      ]
    },
    {
      "id": "b2",
      "prefab": "Board_Single",
      "position": [
        2.113394377264194,
        0,
        0.28914288526866583
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
            0.7,
            0,
            0.26
          ],
          "color": "yellow",
          "coveredBy": [
            "b4",
            "b9",
            "b11"
          ]
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
            "b4",
            "b6",
            "b9",
            "b11"
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
            "b4",
            "b6",
            "b9",
            "b11"
          ]
        }
      ]
    },
    {
      "id": "b3",
      "prefab": "Board_Single",
      "position": [
        -2.670906964319476,
        1,
        0.3041984245413914
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
          "id": "h2",
          "pos": [
            -0.7,
            0,
            0.26
          ],
          "color": "blue",
          "coveredBy": [
            "b5",
            "b10"
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
            "b10"
          ]
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
            "b8",
            "b10"
          ]
        }
      ]
    },
    {
      "id": "b4",
      "prefab": "Board_L",
      "position": [
        2.616034712947623,
        1,
        -0.20201351649593557
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
            -1.4,
            0,
            0.26
          ],
          "color": "red",
          "coveredBy": [
            "b6",
            "b9",
            "b11"
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
            "b6",
            "b9",
            "b11"
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
            "b9",
            "b11"
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
            "b6",
            "b9",
            "b11"
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
            "b9",
            "b11"
          ]
        }
      ]
    },
    {
      "id": "b5",
      "prefab": "Board_Single",
      "position": [
        -4.167365410830826,
        2,
        -0.15215432648546992
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
          "color": "purple"
        },
        {
          "id": "h3",
          "pos": [
            0,
            0,
            0.26
          ],
          "color": "blue"
        },
        {
          "id": "h4",
          "pos": [
            1.4,
            0,
            0.26
          ],
          "color": "green",
          "coveredBy": [
            "b8",
            "b10"
          ]
        }
      ]
    },
    {
      "id": "b6",
      "prefab": "Board_L",
      "position": [
        0.32843189293053,
        2,
        -0.15452471843454985
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
            "b8",
            "b10"
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
            "b9",
            "b11"
          ]
        },
        {
          "id": "h3",
          "pos": [
            -1.5,
            0,
            -1.1
          ],
          "color": "yellow",
          "coveredBy": [
            "b10"
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
            "b9",
            "b11"
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
            "b10"
          ]
        }
      ]
    },
    {
      "id": "b7",
      "prefab": "Board_Single",
      "position": [
        4.206787539622747,
        2,
        0.2203143380116671
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
          "color": "green",
          "coveredBy": [
            "b9",
            "b11"
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
            0,
            0,
            0.26
          ],
          "color": "blue",
          "coveredBy": [
            "b11"
          ]
        }
      ]
    },
    {
      "id": "b8",
      "prefab": "Board_Single",
      "position": [
        -1.8166076844390036,
        3,
        0.3183643173426389
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
            -1.4,
            0,
            0.26
          ],
          "color": "green",
          "coveredBy": [
            "b10"
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
            "b10"
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
            "b10"
          ]
        },
        {
          "id": "h4",
          "pos": [
            1.4,
            0,
            0.26
          ],
          "color": "blue",
          "coveredBy": [
            "b10"
          ]
        }
      ]
    },
    {
      "id": "b9",
      "prefab": "Board_Gear",
      "position": [
        2.2113049547951222,
        3,
        -0.1055408576270565
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
            -0.95
          ],
          "color": "green",
          "coveredBy": [
            "b11"
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
            "b11"
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
            "b11"
          ]
        }
      ]
    },
    {
      "id": "b10",
      "prefab": "Board_Gear",
      "position": [
        -1.8119587416760625,
        4,
        0.297800920996815
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
            -0.55,
            0,
            0
          ],
          "color": "green"
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
            -0.55,
            0,
            0.95
          ],
          "color": "purple"
        }
      ]
    },
    {
      "id": "b11",
      "prefab": "Board_Gear",
      "position": [
        2.347296980721876,
        4,
        -0.26782540455460546
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
            0.55,
            0,
            0
          ],
          "color": "red"
        },
        {
          "id": "h2",
          "pos": [
            1.1,
            0,
            0
          ],
          "color": "red"
        },
        {
          "id": "h3",
          "pos": [
            0.55,
            0,
            0.95
          ],
          "color": "green"
        },
        {
          "id": "h4",
          "pos": [
            -0.55,
            0,
            -0.95
          ],
          "color": "red"
        },
        {
          "id": "h5",
          "pos": [
            -0.55,
            0,
            0.95
          ],
          "color": "blue"
        }
      ]
    }
  ],
  "seed": 30015552
};
