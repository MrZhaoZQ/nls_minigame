'use strict';

module.exports = {
  "id": 29,
  "name": "大师 29",
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
        -1.9031653132042843,
        0,
        0.004924888070672762
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
          "color": "yellow",
          "coveredBy": [
            "b3",
            "b5",
            "b7"
          ]
        },
        {
          "id": "h2",
          "pos": [
            -0.7,
            0,
            -0.26
          ],
          "color": "yellow",
          "coveredBy": [
            "b3",
            "b5",
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
          "color": "blue",
          "coveredBy": [
            "b3",
            "b5",
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
          "color": "green",
          "coveredBy": [
            "b3",
            "b5"
          ]
        }
      ]
    },
    {
      "id": "b2",
      "prefab": "Board_Single",
      "position": [
        2.1225363002377557,
        0,
        0.3040934713324531
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
            -0.7,
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
            0.26
          ],
          "color": "blue",
          "coveredBy": [
            "b4",
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
          "color": "blue",
          "coveredBy": [
            "b4",
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
            "b4",
            "b6",
            "b8"
          ]
        },
        {
          "id": "h5",
          "pos": [
            0.7,
            0,
            0.26
          ],
          "color": "purple",
          "coveredBy": [
            "b4",
            "b6",
            "b8"
          ]
        }
      ]
    },
    {
      "id": "b3",
      "prefab": "Board_Single",
      "position": [
        -1.9248158512390214,
        1,
        0.019498552149161685
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
            0.7,
            0,
            -0.26
          ],
          "color": "green",
          "coveredBy": [
            "b5",
            "b7"
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
            "b5",
            "b7"
          ]
        },
        {
          "id": "h3",
          "pos": [
            0.7,
            0,
            0.26
          ],
          "color": "blue",
          "coveredBy": [
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
          "color": "green",
          "coveredBy": [
            "b5",
            "b7"
          ]
        },
        {
          "id": "h5",
          "pos": [
            -1.4,
            0,
            0.26
          ],
          "color": "blue"
        }
      ]
    },
    {
      "id": "b4",
      "prefab": "Board_Single",
      "position": [
        2.472624489337671,
        1,
        -0.015430837962776445
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
          "color": "yellow",
          "coveredBy": [
            "b8"
          ]
        },
        {
          "id": "h2",
          "pos": [
            -0.7,
            0,
            0.26
          ],
          "color": "red",
          "coveredBy": [
            "b6",
            "b8"
          ]
        },
        {
          "id": "h3",
          "pos": [
            1.4,
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
            -1.4,
            0,
            0.26
          ],
          "color": "purple",
          "coveredBy": [
            "b6",
            "b8"
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
            "b8"
          ]
        }
      ]
    },
    {
      "id": "b5",
      "prefab": "Board_Single",
      "position": [
        -1.9670802498003468,
        2,
        -0.024472407670691587
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
          "color": "yellow"
        },
        {
          "id": "h2",
          "pos": [
            1.4,
            0,
            0.26
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
          "color": "yellow",
          "coveredBy": [
            "b7"
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
            "b7"
          ]
        },
        {
          "id": "h5",
          "pos": [
            0,
            0,
            0.26
          ],
          "color": "green",
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
        1.971011462295428,
        2,
        0.3084609631681815
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
          "color": "yellow",
          "coveredBy": [
            "b8"
          ]
        },
        {
          "id": "h2",
          "pos": [
            -0.7,
            0,
            -0.26
          ],
          "color": "red",
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
            "b8"
          ]
        },
        {
          "id": "h4",
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
      "id": "b7",
      "prefab": "Board_Single",
      "position": [
        -2.4094341066433116,
        3,
        0.15630619891453534
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
          "color": "purple"
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
            0,
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
          "color": "green"
        },
        {
          "id": "h5",
          "pos": [
            1.4,
            0,
            0.26
          ],
          "color": "blue"
        }
      ]
    },
    {
      "id": "b8",
      "prefab": "Board_Single",
      "position": [
        2.3225900892168285,
        3,
        -0.10439799600280819
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
          "color": "yellow"
        },
        {
          "id": "h2",
          "pos": [
            -0.7,
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
          "color": "red"
        },
        {
          "id": "h4",
          "pos": [
            -1.4,
            0,
            0.26
          ],
          "color": "purple"
        },
        {
          "id": "h5",
          "pos": [
            0.7,
            0,
            -0.26
          ],
          "color": "purple"
        },
        {
          "id": "h6",
          "pos": [
            1.4,
            0,
            -0.26
          ],
          "color": "yellow"
        }
      ]
    }
  ],
  "seed": 29001006
};
