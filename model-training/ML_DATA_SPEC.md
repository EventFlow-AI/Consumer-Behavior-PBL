# EventFlow AI — ML Data Specification

## Objective

Build the data pipeline for EventFlow AI's crowd-flow forecasting system.

## Dataset

Real pedestrian-flow data from the Foot Traffic in Würzburg dataset.

## Initial ML Task

Forecast the number of pedestrians at a location one hour into the future.

## Unit of Observation

One row represents one street at one timestamp.

## Source Variables

- id
- streetname
- city
- date
- hour
- weekday
- n_pedestrians
- n_pedestrians_towards
- n_pedestrians_away
- temperature
- weather_condition
- incidents
- collection_type

## Target

n_pedestrians_next_hour

The target represents the pedestrian count at the same street one hour after the current observation.

## Data Quality Rules

- Preserve raw source files unchanged.
- Sort observations by street and timestamp.
- Only create a target when the next observation is exactly one hour later.
- Use measured observations for the initial model.
- The target observation must also be measured.
- Do not artificially fill daylight-saving-time gaps.

## Feature Engineering

Initial features:

- streetname
- hour
- weekday
- temperature
- weather_condition
- incidents
- n_pedestrians
- towards_ratio
- lag_1h
- lag_2h
- lag_3h
- lag_24h
- lag_168h

## Important Feature Relationship

n_pedestrians = n_pedestrians_towards + n_pedestrians_away

Therefore, the three total/directional values should not all be treated as independent model features.

## Dataset Splitting

Use chronological splitting:

- 70% training
- 15% validation
- 15% final test

Do not randomly shuffle the time-series data before splitting.

## Evaluation

Initial metrics:

- MAE
- RMSE

## External Test Data

The provided test.csv contains a future period after the training data and has no pedestrian-count target.

It will be kept separate from the initial train/validation/test pipeline and may be used later for external forecasting experiments.
