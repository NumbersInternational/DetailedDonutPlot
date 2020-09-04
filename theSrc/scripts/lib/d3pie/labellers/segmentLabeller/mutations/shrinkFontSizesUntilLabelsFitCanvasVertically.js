import _ from 'lodash'
import d3 from 'd3'
import * as rootLog from 'loglevel'
import computeLabelStats from '../computeLabelStats'
import { terminateLoop } from '../../../../loopControls'
import { extractAndThrowIfNullFactory } from '../mutationHelpers'

const labelLogger = rootLog.getLogger('label')

const mutationName = 'shrinkFontSizesUntilLabelsFitCanvasVertically'
const mutationFn = ({ outerLabelSet: labelSet, invariant }) => {
  const extractAndThrowIfNull = extractAndThrowIfNullFactory(mutationName)
  const stats = { completed: false }

  const outerPadding = extractAndThrowIfNull(invariant, 'outerPadding')
  const maxFontSize = extractAndThrowIfNull(invariant, 'maxFontSize')
  const minFontSize = extractAndThrowIfNull(invariant, 'minFontSize')
  const canvasHeight = extractAndThrowIfNull(invariant, 'canvasHeight')

  let labelStats = computeLabelStats(labelSet, outerPadding)
  let heightDeficit = labelStats.totalDesiredHeight - canvasHeight

  if (heightDeficit > 0) {
    // apply increasingly aggressive font size scales, until everything is minFontSize
    const fontSizeScaleOptions = _.range(maxFontSize, minFontSize - 1).map((newMaxFontSize, i) => {
      return {
        scale: d3.scale.linear().domain([0, labelSet.length]).range([newMaxFontSize, minFontSize]),
        minFontSize,
        maxFontSize: newMaxFontSize,
        id: i,
      }
    })

    // NB note both labelSet and descendingValuesLabelSet are referencing same data items, so mods to one are reflected in the other
    const descendingValuesLabelSet = _(labelSet).orderBy(['value'], ['desc']).value()

    _(fontSizeScaleOptions).each(({ scale, minFontSize, maxFontSize, id }) => {
      stats.lastIteration = id
      _(descendingValuesLabelSet).each((label, i) => { label.fontSize = Math.round(scale(i)) })
      labelStats = computeLabelStats(labelSet, outerPadding)
      labelLogger.info(`Applying labelFontScale option ${id}: font range: [${minFontSize}:${maxFontSize}]`)
      labelLogger.info(`New fontSizeDistribution: ${JSON.stringify(labelStats.fontSizeDistribution, {}, 2)}`)

      if (labelStats.totalDesiredHeight <= canvasHeight) {
        labelLogger.info(`labelFontScale option(${id}):[${minFontSize}:${maxFontSize}] provided enough shrinkage. Moving on to next step`)
        stats.completed = true
        return terminateLoop
      }
    })
  }

  return {
    newOuterLabelSet: labelSet,
    newInnerLabelSet: [],
    newVariants: {},
    stats,
  }
}

module.exports = {
  mutationName,
  mutationFn,
}
