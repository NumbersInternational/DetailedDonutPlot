const defaultSettings = {
  size: {
    canvasHeight: 500,
    canvasWidth: 500,
    pieInnerRadius: 0.8, // pieWrapper: settings.innerRadius, R: inner.radius
    labelThreshold: 100, // pieWrapper: settings.canvasSizeDrawLabelThreshold, R: canvas.size.labels.min
    labelOffset: 0.1, // pieWrapper: settings.labelOffset, R: labels.offset
  },
  data: {
    color: null, // pieWrapper: settings.valuesColor, values.color
    dataFormatter: null, // pieWrapper: settings.valuesDec, R: values.decimal.places
    display: null, // pieWrapper: settings.valuesDisplay, R: values.display.as. options: [null, 'percentage']
    content: [], // pieWrapper: pieData
  },
  labels: {
    enabled: true, // pieWrapper: settings.labelsEnabled, R: labels.enabled
    stages: {
      outOfBoundsCorrection: true,
      initialClusterSpacing: true,
      downSweep: true,
      upSweep: true,
      shortenTopAndBottom: true,
      finalPass: true,
    },
    segment: {
      color: '#333333', // pieWrapper: settings.labelsColor, R: labels.font.color
      displayDecimals: 1, // pieWrapper: settings.valuesDec, R: values.decimal.places
      displayPercentage: false, // pieWrapper: settings.valuesDisplay, R: values.display.as
      fontFamily: 'arial', // pieWrapper: settings.labelsFont, R: labels.font.family // TODO change to setting.fontFamily
      useInnerLabels: false, // pieWrapper: settings.useInnerLabels, R: labels.inner
      innerPadding: 1, // pieWrapper: settings.labelsInnerPadding, R: labels.inner.padding
      labelMaxLineAngle: 80, // pieWrapper: settings.labelMaxLineAngle, R: labels.advanced.line.max.angle
      liftOffAngle: 30, // pieWrapper: settings.liftOffAngle, R: labels.advanced.liftoff.angle
      linePadding: 2, // pieWrapper: settings.linePadding, R: labels.line.padding
      maxLabelOffset: 100, // TODO use these values and expose as configurable
      maxLines: 6, // pieWrapper: settings.labelMaxLines, R: labels.max.lines. Truncate after X vertical lines of text
      maxVerticalOffset: null, // pieWrapper: settings.labelMaxVerticalOffset. R: labels.advanced.offset.yaxis.max. Max label offset at the 90
      maxWidthProportion: 0.3, // pieWrapper: settings.labelsMaxWidth. R: labels.max.width. wrap label text if label exceeds X% of canvasWidth // TODO change to settings.labelsMaxWidthProportion
      minLabelOffset: 5, // TODO use these values and expose as configurable
      minProportion: 0.003, // pieWrapper: settings.minProportion, R: values.display.thres
      outerPadding: 1, // pieWrapper: settings.labelsOuterPadding, R: labels.outer.padding
      preferredMinFontSize: 8, // pieWrapper: settings.labelsMinFontSize, R: labels.min.font.size
      preferredMaxFontSize: 8, // pieWrapper: settings.labelsSize, R: labels.font.size // TODO change to labelsMaxFontSize
      prefix: null, // pieWrapper: settings.prefix, R: prefix
      spacingBetweenUpperTrianglesAndCenterMeridian: 7, // hard code
      suffix: null, // pieWrapper: settings.suffix, R: suffix
    },
    lines: {
      enabled: true, // used but not currently configurable via R or JS
      outer: {
        straight: {
          minAngle: 360, // off
          maxAngle: 360, // off
        },
        basisInterpolated: {
          minAngle: 360, // off
          maxAngle: 360, // off
        },
        bezier: {
          minAngle: 0,
          maxAngle: 360,
          segmentLeanAngle: 0,
          labelLeanAngle: 0,
          segmentPullInProportionMin: 0.25,
          segmentPullInProportionMax: 0.75,
        },
      },
    },
  },
  effects: {
    load: {
      effect: 'default', // pieWrapper: settings.loadingAnimationEnabled. options ['none', 'default']. Not exposed to R
      speed: 1000, // pieWrapper: settings.loadingAnimationSpeed. milliseconds value for animation duration. Not exposed to R
    },
    pullOutSegmentOnClick: { // not used
      effect: 'bounce', // not used
      speed: 300, // not used
      size: 10, // not used
    },
    highlightLuminosity: 40, // not used
    highlightTextLuminosity: 40, // not used
  },
  tooltips: { //
    enabled: true, // pieWrapper: HARD CODE
    maxWidth: 0.3, // pieWrapper: settings.tooltipMaxWidth, R: tooltips.max.width
    maxHeight: 0.3, // pieWrapper: settings.tooltipMaxHeight, R: tooltips.max.height
    type: 'placeholder', // pieWrapper: HARD CODE
    string: '', // pieWrapper: HARD CODE
    placeholderParser: null, // pieWrapper: HARD CODE
    styles: { //
      backgroundColor: null, // pieWrapper: _settings.tooltipBackgroundColor, R: tooltips.bg.color
      backgroundOpacity: 0.8, // pieWrapper: HARD CODE
      borderRadius: 2, // pieWrapper: HARD CODE
      fadeInSpeed: 1, // pieWrapper: HARD CODE
      font: 'arial', // pieWrapper: settings.tooltipFontFamily, R: tooltips.font.family
      fontColor: null, // pieWrapper: settings.tooltipFontColor, R: tooltips.font.color
      fontSize: 10, // pieWrapper: settings.tooltipFontSize, R: tooltips.font.size
      padding: 4, // pieWrapper: HARD CODE

    }, //
  },
  misc: { //
    colors: { //
      background: null, // pieWrapper: HARD CODE
      segmentStroke: '#ffffff', // pieWrapper: settings.borderColor, R: border.color
    },
    cssPrefix: null, // pieWrapper dynamically sets this to a uniqueId
  },
  groups: { //
    content: null, // pieWrapper: groupData,
    font: 'arial', // pieWrapper: settings.groupsFont, R: groups.font.family
    fontSize: 10, // pieWrapper: settings.groupsSize, R: groups.font.size
    fontColor: '#333333', // pieWrapper: settings.groupsFontColor, R: groups.color
    minFontSize: null, // pieWrapper: settings.groupLabelsMinFontSize, R: groups.min.font.size
    fontWeight: 'normal', // pieWrapper: settings.groupsBold, R: groups.font.bold
    labelsEnabled: true, // pieWrapper: settings.groupLabelsEnabled, R: groups.labels.enabled
  },
}

module.exports = defaultSettings
