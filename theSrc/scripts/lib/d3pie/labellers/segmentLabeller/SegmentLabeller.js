import _ from 'lodash'
import helpers from './../../helpers'
import OuterLabel from './outerLabel'
import computeLabelStats from './computeLabelStats'
import wrapAndFormatLabelUsingSvgApproximation from './utils/wrapAndFormatLabelUsingSvgApproximation'
import placeLabelAlongLabelRadiusWithLiftOffAngle from './utils/placeLabelAlongLabelRadiusWithLiftOffAngle'
import adjustLabelToNewY from './utils/adjustLabelToNewY'
import computeCoordOnEllipse from './utils/computeCoordOnEllipse'
import draw from './draw'
import { labelLogger } from '../../../logger'
import {
  initialNaivePlacement,
  performCollisionResolution,
  performDescendingOrderCollisionResolution,
  performOutOfBoundsCorrection,
  removeLabelsUntilLabelsFitCanvasVertically,
  shortenTopAndBottom,
  shrinkFontSizesUntilLabelsFitCanvasVertically,
} from './mutations'
import d3 from 'd3'

// define the rest of the variants that get set later - do this in the config data class
const VARIABLE_CONFIG = [
  'labelMaxLineAngle',
  'minProportion',
]

const INVARIABLE_CONFIG = [
  'color',
  'displayDecimals',
  'displayPercentage',
  'prefix',
  'suffix',
  'fontFamily',
  'innerPadding',
  'liftOffAngle',
  'linePadding',
  'maxLabelOffset',
  'maxLines',
  'maxVerticalOffset',
  'maxWidthProportion',
  'minLabelOffset',
  'outerPadding',
  'preferredMaxFontSize',
  'preferredMinFontSize',
  'spacingBetweenUpperTrianglesAndCenterMeridian',
  'useInnerLabels',
]

class SegmentLabeller {
  constructor ({ dataPoints, sortOrder, config, linesConfig, animationConfig, canvas, interactionController, highlightTextLuminosity }) {
    this.canvas = canvas
    this.interactionController = interactionController
    this.linesConfig = linesConfig
    this.animationConfig = animationConfig

    const { variant, invariant } = this.processConfig(config)
    this._variant = variant
    this._invariant = invariant

    this._variant.hasBottomLabel = false
    this._variant.hasTopLabel = false
    this._variant.bottomIsLifted = false
    this._variant.topIsLifted = false
    this._variant.maxFontSize = this._invariant.preferredMaxFontSize
    this._variant.minFontSize = this._invariant.preferredMinFontSize

    this._invariant.maxLabelWidth = this.canvas.width * this._invariant.maxWidthProportion
    this._invariant.originalDataPoints = dataPoints
    this._invariant.sortOrder = sortOrder
    this._invariant.highlightTextLuminosity = highlightTextLuminosity

    this.interface = {
      canvas: this.extendCanvasInterface(canvas),
    }

    this.phaseHistory = []

    /* NB this is odd. Rationale
        * The label sets are constantly cloned.
        * The canvas object is updated in the parent
        * If a label clone is done, and later an update to canvas is made, the cloned label will have a copy of the old canvas
          that does not include the updates. By passing a fn, the updated canvas can always be retrieved
     */
    const canvasInterface = () => this.interface.canvas

    const start = Date.now()
    this.labelSets = {
      primary: {
        outer: this.buildLabels({
          dataPoints,
          minProportion: this._variant.minProportion,
          canvasInterface,
        }),
        inner: [],
      },
    }
    this.phaseHistory.push({
      name: 'buildLabels',
      totalDuration: Date.now() - start,
    })
  }

  buildLabels ({ dataPoints, minProportion, canvasInterface }) {
    const totalValue = _(dataPoints).map('value').sum()
    let cumulativeValue = 0

    return dataPoints
      .map(dataPoint => {
        const angleExtent = dataPoint.value * 360 / totalValue
        const angleStart = cumulativeValue * 360 / totalValue
        cumulativeValue += dataPoint.value

        return new OuterLabel({
          canvasInterface,
          color: dataPoint.color,
          displayDecimals: this._invariant.displayDecimals,
          displayPercentage: this._invariant.displayPercentage,
          prefix: this._invariant.prefix,
          suffix: this._invariant.suffix,
          fontFamily: this._invariant.fontFamily,
          fontSize: this._invariant.preferredMaxFontSize,
          proportion: dataPoint.value / totalValue,
          group: dataPoint.group,
          id: dataPoint.id,
          innerPadding: this._invariant.innerPadding,
          label: dataPoint.label,
          segmentAngleMidpoint: angleStart + angleExtent / 2,
          value: dataPoint.value,
        })
      })
      // NB filter here after the creation map as we are tracking cumulative value above so must process ALL
      .filter(({ proportion }) => { return proportion >= minProportion })
  }

  doMutation ({ mutationName, mutationFn }) {
    const start = Date.now()
    const {
      newInnerLabelSet = null,
      newOuterLabelSet = null,
      newVariants = {},
      stats = {},
    } = mutationFn({
      outerLabelSet: _.cloneDeep(this.labelSets.primary.outer),
      innerLabelSet: _.cloneDeep(this.labelSets.primary.inner),
      variant: _.cloneDeep(this._variant),
      invariant: _.cloneDeep(this._invariant),
      canvas: this.interface.canvas,
    })
    stats.name = mutationName
    stats.totalDuration = Date.now() - start
    stats.returnedInnerLabelSet = !_.isNull(newInnerLabelSet)
    stats.returnedInnerLabelSetSize = _.isNull(newInnerLabelSet) ? null : newInnerLabelSet.length
    stats.returnedOuterLabelSet = !_.isNull(newOuterLabelSet)
    stats.returnedOuterLabelSetSize = _.isNull(newOuterLabelSet) ? null : newOuterLabelSet.length
    this.phaseHistory.push(stats)

    labelLogger.info(`Mutation ${mutationName} completed`)
    if (newOuterLabelSet) {
      this.labelSets.primary.outer = newOuterLabelSet
    }
    if (newInnerLabelSet) {
      this.labelSets.primary.inner = newInnerLabelSet
    }
    _(newVariants).each((newValue, variantName) => {
      if (this._variant[variantName] !== newValue) {
        labelLogger.info(`Mutation ${mutationName} changed ${variantName} from ${this._variant[variantName]} to ${newValue}`)
        this._variant[variantName] = newValue
      }
    })

    return {
      stats,
      newVariants,
    }
  }

  draw () {
    // TODO: future work. Add inner labels to performDescendingOrderCollisionResolution mutation
    // until then, for compatibility with existing plots, if user requests inner labels then use old algo (i.e., performCollisionResolution)
    if (this._invariant.sortOrder === 'descending' && !this._invariant.useInnerLabels) {
      this.doMutation(performDescendingOrderCollisionResolution)
    } else {
      this.doMutation(initialNaivePlacement)
      this.doMutation(performOutOfBoundsCorrection)
      this.doMutation(performCollisionResolution)
      this.doMutation(shortenTopAndBottom)
    }
    this._draw()

    labelLogger.info('Done labelling. Summary:')
    labelLogger.info(JSON.stringify(this.phaseHistory, {}, 2))
  }

  extendCanvasInterface (canvas) {
    canvas.getLabelSize = ({ labelText, fontSize, fontFamily }) => {
      return wrapAndFormatLabelUsingSvgApproximation({
        parentContainer: this.canvas.svg,
        labelText,
        fontSize,
        fontFamily,
        maxLabelWidth: this._invariant.maxLabelWidth,
        innerPadding: this._invariant.innerPadding,
        maxLabelLines: this._invariant.maxLines,
      })
    }

    canvas.placeLabelAlongLabelRadiusWithLift = ({ label, hasTopLabel, hasBottomLabel }) => {
      return placeLabelAlongLabelRadiusWithLiftOffAngle({
        labelDatum: label,
        labelOffset: this.interface.canvas.labelOffset,
        labelLiftOffAngle: this._invariant.liftOffAngle,
        outerRadius: this.interface.canvas.outerRadius,
        pieCenter: this.interface.canvas.pieCenter,
        canvasHeight: this.interface.canvas.height,
        maxFontSize: this._variant.maxFontSize,
        maxVerticalOffset: this.interface.canvas.maxVerticalOffset,
        hasTopLabel,
        hasBottomLabel,
        minGap: this._invariant.outerPadding,
        spacingBetweenUpperTrianglesAndCenterMeridian: this._invariant.spacingBetweenUpperTrianglesAndCenterMeridian,
      })
    }

    canvas.placeLabelAlongLabelRadius = ({ label, hasTopLabel, hasBottomLabel }) => {
      return placeLabelAlongLabelRadiusWithLiftOffAngle({
        labelDatum: label,
        labelOffset: this.interface.canvas.labelOffset,
        labelLiftOffAngle: 0,
        outerRadius: this.interface.canvas.outerRadius,
        pieCenter: this.interface.canvas.pieCenter,
        canvasHeight: this.interface.canvas.height,
        maxFontSize: this._variant.maxFontSize,
        maxVerticalOffset: this.interface.canvas.maxVerticalOffset,
        hasTopLabel,
        hasBottomLabel,
        minGap: this._invariant.outerPadding,
        spacingBetweenUpperTrianglesAndCenterMeridian: this._invariant.spacingBetweenUpperTrianglesAndCenterMeridian,
      })
    }

    canvas.adjustLabelToNewY = ({ anchor, newY, label, topIsLifted, bottomIsLifted, hemisphere }) => {
      const { pieCenter, outerRadius, labelOffset, maxVerticalOffset } = this.interface.canvas
      const { liftOffAngle, outerPadding, spacingBetweenUpperTrianglesAndCenterMeridian } = this._invariant
      const { hasTopLabel, hasBottomLabel, maxFontSize } = this._variant

      // TODO this was ported correctly but it looks like the X's should by Y's ?
      let apexLabelCorrection = 0
      if ((label.topLeftCoord.x < pieCenter.x && hasTopLabel) ||
        (label.topLeftCoord.x > pieCenter.x && hasBottomLabel)) {
        apexLabelCorrection = maxFontSize + outerPadding
      }

      return adjustLabelToNewY({
        labelDatum: label,
        anchor,
        newY,
        labelRadius: outerRadius + labelOffset,
        yRange: outerRadius + maxVerticalOffset - apexLabelCorrection,
        labelLiftOffAngle: liftOffAngle,
        pieCenter: pieCenter,
        topIsLifted,
        bottomIsLifted,
        spacingBetweenUpperTrianglesAndCenterMeridian,
        hemisphere,
      })
    }

    canvas.computeCoordOnEllipse = ({ angle, radialWidth, radialHeight }) => {
      const { pieCenter, outerRadius, labelOffset } = this.interface.canvas
      return computeCoordOnEllipse({
        angle,
        radialWidth: radialWidth || outerRadius + labelOffset, // default to the labelPlacementCircle
        radialHeight: radialHeight || outerRadius + labelOffset, // default to the labelPlacementCircle
        pieCenter,
      })
    }

    canvas.labelIsInBounds = (label) => {
      const { minX, maxX, minY, maxY } = label
      const { height, width } = this.interface.canvas
      return (minX >= 0) && (maxX <= width) && (minY >= 0) && (maxY <= height)
    }

    return canvas
  }

  // TODO rename to getOuterLabelStats, or include inner stats
  getLabelStats () {
    return computeLabelStats(this.labelSets.primary.outer, this._invariant.outerPadding)
  }

  getLabels () {
    return this.labelSets.primary
  }

  preprocessLabelSet () {
    const canvasHeight = this.interface.canvas.height

    const start = Date.now()
    let labelStats = this.getLabelStats()
    if (labelStats.totalDesiredHeight > canvasHeight) {
      this.doMutation(shrinkFontSizesUntilLabelsFitCanvasVertically)
    }

    labelStats = this.getLabelStats()
    if (labelStats.totalDesiredHeight > canvasHeight) {
      labelLogger.info('all font shrinking options exhausted, must now start removing labels by increasing minProportion')
      this.doMutation(removeLabelsUntilLabelsFitCanvasVertically)
    }
    this.phaseHistory.push({
      name: 'preprocessLabelSet',
      totalDuration: Date.now() - start,
    })
  }

  processConfig (config) {
    const variant = _.pick(config, VARIABLE_CONFIG)
    const invariant = _.pick(config, INVARIABLE_CONFIG)
    return { variant, invariant }
  }

  clearPreviousFromCanvas () {
    const { svg, cssPrefix } = this.interface.canvas
    svg.selectAll(`.${cssPrefix}labels-outer`).remove()
    svg.selectAll(`.${cssPrefix}labels-inner`).remove()
    svg.selectAll(`.${cssPrefix}lineGroups-outer`).remove()
    svg.selectAll(`.${cssPrefix}lineGroups-inner`).remove()
  }

  _draw () {
    const { canvas } = this.interface
    const { color, innerPadding } = this._invariant
    const { labelMaxLineAngle } = this._variant
    const { inner, outer } = this.labelSets.primary

    draw.drawLabelSet({
      canvas,
      labels: outer,
      labelColor: color,
      innerPadding: innerPadding,
      labelType: 'outer',
    })

    draw.drawLabelSet({
      canvas,
      labels: inner,
      labelColor: color,
      innerPadding: innerPadding,
      labelType: 'inner',
    })

    if (this.linesConfig.enabled) {
      draw.drawOuterLabelLines({
        canvas,
        labels: outer,
        labelMaxLineAngle,
        config: this.linesConfig.outer,
      })
      draw.drawInnerLabelLines({
        canvas,
        labels: inner,
      })
    }

    draw.fadeInLabelsAndLines({
      canvas,
      animationConfig: this.animationConfig,
    })

    this.addEventHandlers()
  }

  addEventHandlers () {
    const cssPrefix = this.canvas.cssPrefix
    let allSegmentLabels = d3.selectAll('.' + cssPrefix + 'labelGroup-outer')

    allSegmentLabels.on('mouseover', (labelData) => {
      this.interactionController.hoverOnSegmentLabel(labelData.id)
    })

    allSegmentLabels.on('mouseout', (labelData) => {
      this.interactionController.hoverOffSegmentLabel(labelData.id)
    })
  }

  highlightLabel (id) {
    const { cssPrefix, svg } = this.interface.canvas
    const label = svg.select(`#${cssPrefix}segmentMainLabel${id}-outer`)
    label.style('fill', helpers.increaseBrightness(this._invariant.color, this._invariant.highlightTextLuminosity))
  }

  unhighlightLabel (id) {
    const { cssPrefix, svg } = this.interface.canvas
    const label = svg.select(`#${cssPrefix}segmentMainLabel${id}-outer`)
    label.style('fill', this._invariant.color)
  }

  isLabelShown (id) {
    return _.some(this.labelSets.primary.outer, { id }) || _.some(this.labelSets.primary.inner, { id })
  }
}

module.exports = SegmentLabeller
