'use strict';

module.exports = {
  "id": 10,
  "name": "成长 10",
  "colors": [
    "red",
    "blue",
    "yellow",
    "green"
  ],
  "slotCount": 5,
  "gridSize": 14,
  "boards": [
    {
      "id": "b1",
      "prefab": "Board_Single",
      "position": [
        -1.8817354611093169,
        0,
        0.20509818703867488
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
            1.4,
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
          "color": "blue"
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
            0.26
          ],
          "color": "red"
        },
        {
          "id": "h5",
          "pos": [
            -1.4,
            0,
            -0.26
          ],
          "color": "green",
          "coveredBy": [
            "b3"
          ]
        }
      ]
    },
    {
      "id": "b2",
      "prefab": "Board_Single",
      "position": [
        2.386043356682173,
        0,
        -0.28302360295783724
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
            0.7,
            0,
            -0.26
          ],
          "color": "red"
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
            1.4,
            0,
            0.26
          ],
          "color": "green"
        },
        {
          "id": "h4",
          "pos": [
            -1.4,
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
          "color": "red"
        }
      ]
    },
    {
      "id": "b3",
      "prefab": "Board_Gear",
      "position": [
        -3.867743205302395,
        1,
        0.13515741948504
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
          "color": "yellow"
        },
        {
          "id": "h2",
          "pos": [
            -0.55,
            0,
            0.95
          ],
          "color": "yellow"
        },
        {
          "id": "h3",
          "pos": [
            -1.1,
            0,
            0
          ],
          "color": "green"
        },
        {
          "id": "h4",
          "pos": [
            0.55,
            0,
            0.95
          ],
          "color": "yellow"
        },
        {
          "id": "h5",
          "pos": [
            0.55,
            0,
            0
          ],
          "color": "blue"
        }
      ]
    },
    {
      "id": "b4",
      "prefab": "Board_Single",
      "position": [
        0.19182624944951387,
        1,
        0.32466827100142837
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
            0,
            0,
            0.26
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
          "color": "green"
        },
        {
          "id": "h3",
          "pos": [
            0.7,
            0,
            -0.26
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
          "color": "blue"
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
      "id": "b5",
      "prefab": "Board_Single",
      "position": [
        4.069870099029504,
        1,
        -0.28162209661677473
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
            0,
            0,
            0.26
          ],
          "color": "green"
        },
        {
          "id": "h3",
          "pos": [
            -0.7,
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
            -0.26
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
          "color": "red"
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
    }
  ],
  "seed": 10000051
};
