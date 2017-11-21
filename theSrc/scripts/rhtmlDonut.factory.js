import $ from 'jquery'
import d3 from 'd3'
import d3pie from './lib/d3pie/d3pie'
import Rainbow from './lib/d3pie/rainbowvis'
import {Footer, Title, Subtitle} from 'rhtmlParts'

// support multiple donuts on screen by assigining unique cssPrefix
let uniqueDonutIdentifier = 1

function DetailedDonutPlot (uniqueId) {
  let values,
    labels,
    settings,
    pie,
    n,
    width = 500,
    height = 500

  function resizeChart (el) {

    if (width < 200) {
      return
    }

    if (height < 200) {
      return
    }

    d3.select('.menuBox').attr('transform', 'translate(' + (width - 33 - 10) + ',' + 5 + ')')

    pie.options.size.canvasWidth = width
    pie.options.size.canvasHeight = height
    var pieDist = Math.min(width / 30, height / 25, 25)
    var offsetSize = Math.min(width / 25, height / 20, 20)
    pie.options.labels.outer.pieDistance = pieDist
    pie.options.labels.outer.offsetSize = offsetSize

    var canvasPadding = pie.options.misc.canvasPadding
    var w = width - canvasPadding.left - canvasPadding.right
    var h = height - canvasPadding.top - canvasPadding.bottom

    // for really teeny pies, h may be < 0. Adjust it back
    h = (h < 0) ? 0 : h

    var outerRadius = ((w * 0.67 < h) ? w * 0.67 : h) / 3
    pie.redrawWithoutLoading()
  }

  function chart (selection) {
    // from http://stackoverflow.com/questions/6443990/javascript-calculate-brighter-colour
    function increaseBrightness (hex, percent) {
      // strip the leading # if it's there
      hex = hex.replace(/^\s*#|\s*$/g, '')

      // convert 3 char codes --> 6, e.g. `E0F` --> `EE00FF`
      if (hex.length == 3) {
        hex = hex.replace(/(.)/g, '$1$1')
      }

      var r = parseInt(hex.substr(0, 2), 16),
        g = parseInt(hex.substr(2, 2), 16),
        b = parseInt(hex.substr(4, 2), 16)

      return '#' +
        ((0 | (1 << 8) + r + (256 - r) * percent / 100).toString(16)).substr(1) +
        ((0 | (1 << 8) + g + (256 - g) * percent / 100).toString(16)).substr(1) +
        ((0 | (1 << 8) + b + (256 - b) * percent / 100).toString(16)).substr(1)
    }

    // from http://www.sitepoint.com/javascript-generate-lighter-darker-color/
    function colorLuminance (hex, lum) {

      // validate hex string
      hex = String(hex).replace(/[^0-9a-f]/gi, '')
      if (hex.length < 6) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2]
      }
      lum = lum || 0

      // convert to decimal and change luminosity
      var rgb = '#', c, i
      for (i = 0; i < 3; i++) {
        c = parseInt(hex.substr(i * 2, 2), 16)
        c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16)
        rgb += ('00' + c).substr(c.length)
      }

      return rgb
    }

    // select svg element
    var svgEl = selection.select('svg')[0][0]

    var pieData = [],
      pieColor = [],
      groupData,
      groupColor = [],
      i

    if (settings.groups) {
      groupData = []
      var hash = {},
        idx,
        deltaLum,
        lum,
        baseColor,
        nInGroups = []

      if (!settings.groupsColor) {
        settings.groupsColor = d3.scale.category20().range()
      }

      if (settings.groupsSums.length > settings.groupsColor.length) {
        var colLen = settings.groupsColor.length
        for (i = 0; i < settings.groupsSums.length - colLen; i++) {
          var newColor = settings.groupsColor[i % colLen]
          settings.groupsColor.push(newColor)
        }
      }

      for (i = 0; i < settings.groupsSums.length; i++) {
        groupData.push({
          label: settings.groupsNames[i], value: settings.groupsSums[i],
          color: settings.groupsColor[i], count: settings.groupsCounts[i]
        })
      }

      for (i = 0; i < n; i++) {
        pieData.push({label: labels[i], value: values[i], index: i, group: settings.groups[i]})
      }

      for (i = 0; i < settings.groupsSums.length; i++) {
        hash[groupData[i].label] = i
        nInGroups.push(0)
      }

      if (!settings.valuesColor) {
        settings.valuesColor = []
        for (i = 0; i < n; i++) {
          idx = hash[pieData[i].group]
          baseColor = groupData[idx].color
          deltaLum = 0.3 / groupData[idx].count
          if (deltaLum > 0.2) {
            deltaLum = 0.2
          }
          lum = deltaLum * (1 + nInGroups[idx])
          try {
            pieData[i].color = increaseBrightness(baseColor, lum * 100)
          } catch (e) {
            console.log('color error, baseColor is' + baseColor)
          }

          nInGroups[idx] += 1
        }
      } else {
        for (i = 0; i < n; i++) {
          pieData[i].color = settings.valuesColor[i]
        }
      }
    } else {
      if (!settings.valuesColor) {

        if (settings.gradient) {
          var colGrad = new Rainbow()
          colGrad.setSpectrum('darkblue', 'yellow')
          colGrad.setNumberRange(0, n - 1)
          settings.valuesColor = []

          for (i = 0; i < n; i++) {
            settings.valuesColor.push('#' + colGrad.colourAt(i))
          }
        } else {
          settings.valuesColor = d3.scale.category20().range()
        }
      }

      var colors = [], valColLen = settings.valuesColor.length
      if (values.length > valColLen) {
        for (i = 0; i < n; i++) {
          var newCol = settings.valuesColor[i % valColLen]
          colors.push(newCol)
        }
        settings.valuesColor = colors
      }

      for (i = 0; i < n; i++) {
        pieData.push({label: labels[i], value: values[i], index: i, color: settings.valuesColor[i]})
      }

    }

    let dataFormatter = null
    if (settings.valuesDec >= 0) {
      dataFormatter = d3.format(',.' + settings.valuesDec + 'f')
    } else {
      dataFormatter = d3.format(',.1f')
    }

    //var pieDist = Math.min(width/30, height/25, 10);
    //var offsetSize = Math.min(width/25, height/20, 20);
    var pieDist = Math.min(width / 30, height / 25, 25)
    var offsetSize = Math.min(width / 25, height / 20, 20)

    var canvasPadding = {
      top: 5,
      right: 5,
      bottom: 5,
      left: 5
    }
    var w = width - canvasPadding.left - canvasPadding.right
    var h = height - canvasPadding.top - canvasPadding.bottom

    // for really teeny pies, h may be < 0. Adjust it back
    h = (h < 0) ? 0 : h

    var outerRadius = ((w * 0.67 < h) ? w * 0.67 : h) / 3

    if (settings.orderControl === 'visible') {

      var menuBox = selection.select('svg')
        .append('g')
        .attr('class', 'menuBox')
        .style('-webkit-touch-callout', 'none')
        .style('-webkit-user-select', 'none')
        .style('-khtml-user-select', 'none')
        .style('-moz-user-select', 'none')
        .style('-ms-user-select', 'none')
        .style('user-select', 'none')

      var menuBoxW = 33,
        menuBoxH = 28

      menuBox.attr('transform', 'translate(' + (width - menuBoxW - 10) + ',' + 5 + ')')

      var menuRect = menuBox.append('rect')
        .attr('class', 'menuRect')
        .attr('width', menuBoxW)
        .attr('height', menuBoxH)
        .attr('x', 0)
        .attr('y', 0)
        .style('fill', 'white')
        .style('stroke-width', '1px')
        .style('stroke', '#000')
        .style('opacity', 0.5)
        .style('cursor', 'pointer')

      var linesY = [7, 14, 21]
      var lines = menuBox.selectAll('line')
        .data(linesY)
        .enter()
        .append('line')
        .attr('x1', '6px')
        .attr('x2', '27px')
        .attr('y1', function (d) { return d + 'px'})
        .attr('y2', function (d) { return d + 'px'})
        .style('stroke', '#000')
        .style('stroke-width', 1)
        .style('cursor', 'pointer')
        .style('opacity', 0.5)

      var valuesOrder = ['Descending', 'Alphabetical', 'Initial']
      var groupOrder = ['Descending', 'Alphabetical', 'Initial']

      var menuTextSize = 11
      var valuesSortHeadingSpace = menuTextSize * 1.5

      var valuesSortHeading = menuBox
        .append('text')
        .text('Values order')
        .attr('x', 0)
        .attr('y', valuesSortHeadingSpace / 2)
        .attr('dy', '0.35em')
        .style('cursor', 'pointer')
        .style('font-family', 'Arial')
        .style('font-size', menuTextSize + 'px')
        .style('opacity', 0)

      var valuesSortText = menuBox.selectAll('t')
        .data(valuesOrder)
        .enter()
        .append('text')
        .text(function (d) { return d})
        .attr('x', 0)
        .attr('y', function (d, i) { return linesY[i]})
        .attr('dy', '0.35em')
        .style('cursor', 'pointer')
        .style('font-family', 'Arial')
        .style('font-size', menuTextSize + 'px')
        .style('opacity', 0)

      var groupsSortHeading = menuBox
        .append('text')
        .text('Groups order')
        .attr('x', 0)
        .attr('y', 28)
        .attr('dy', '0.35em')
        .style('cursor', 'pointer')
        .style('font-family', 'Arial')
        .style('font-size', menuTextSize + 'px')
        .style('opacity', 0)

      var groupsSortText = menuBox.selectAll('t')
        .data(groupOrder)
        .enter()
        .append('text')
        .text(function (d) { return d})
        .attr('x', 0)
        .attr('y', function (d, i) { return linesY[i]})
        .attr('dy', '0.35em')
        .style('cursor', 'pointer')
        .style('font-family', 'Arial')
        .style('font-size', menuTextSize + 'px')
        .style('opacity', 0)

      menuBox.on('mouseover', function (d) {
        menuBox.transition()
          .duration(200)
          .attr('transform', 'translate(' + (width - menuBoxW - 50 - 10) + ',' + 5 + ')')

        menuRect.transition()
          .duration(200)
          .attr('width', menuBoxW + 50)
          .attr('height', 8 * menuTextSize * 1.5)

        valuesSortHeading.transition()
          .duration(200)
          .style('opacity', 1)
          .attr('x', 2)

        valuesSortText.transition()
          .duration(200)
          .style('opacity', 1)
          .attr('x', 20)
          .attr('y', function (d, i) { return menuTextSize * 1.5 * i + valuesSortHeadingSpace + menuTextSize * 1.5 / 2})

        groupsSortHeading.transition()
          .duration(200)
          .style('opacity', 1)
          .attr('y', function (d, i) { return menuTextSize * 1.5 * 3 + valuesSortHeadingSpace * 1.5})
          .attr('x', 2)

        groupsSortText.transition()
          .duration(200)
          .style('opacity', 1)
          .attr('x', 20)
          .attr('y', function (d, i) { return menuTextSize * 1.5 * i + valuesSortHeadingSpace * 2 + menuTextSize * 1.5 * 3 + menuTextSize * 1.5 / 2})

        lines.transition()
          .duration(200)
          .style('opacity', 0)
      })
        .on('mouseout', function (d) {
          menuBox.transition()
            .duration(200)
            .attr('transform', 'translate(' + (width - menuBoxW - 10) + ',' + 5 + ')')

          menuRect.transition()
            .duration(200)
            .attr('width', menuBoxW)
            .attr('height', menuBoxH)

          valuesSortHeading.transition()
            .duration(200)
            .style('opacity', 0)
            .attr('x', 0)

          valuesSortText.transition()
            .duration(200)
            .style('opacity', 0)
            .attr('x', 0)
            .attr('y', function (d, i) { return linesY[i]})

          groupsSortHeading.transition()
            .duration(200)
            .style('opacity', 0)
            .attr('y', 28)
            .attr('x', 0)

          groupsSortText.transition()
            .duration(200)
            .style('opacity', 0)
            .attr('x', 0)
            .attr('y', function (d, i) { return linesY[i]})

          lines.transition()
            .duration(200)
            .style('opacity', 0.5)
        })
    }

    // create the pie chart instance
    pie = new d3pie(svgEl, {
      size: {
        canvasWidth: width,
        canvasHeight: height,
        pieInnerRadius: settings.innerRadius ? settings.innerRadius : '80%'
      },
      data: {
        sortOrder: settings.valuesOrder,
        font: settings.valuesFont ? settings.valuesFont : 'arial',
        fontSize: settings.valuesSize ? settings.valuesSize : 10,
        prefix: settings.prefix,
        suffix: settings.suffix,
        color: settings.valuesColor,
        dataFormatter: dataFormatter,
        display: settings.valuesDisplay,
        minAngle: settings.minAngle,
        content: pieData
      },
      misc: {
        colors: {
          background: null,
          segments: settings.valuesColor ? settings.valuesColor : [
            '#2484c1', '#65a620', '#7b6888', '#a05d56', '#961a1a', '#d8d23a', '#e98125', '#d0743c', '#635222', '#6ada6a',
            '#0c6197', '#7d9058', '#207f33', '#44b9b0', '#bca44a', '#e4a14b', '#a3acb2', '#8cc3e9', '#69a6f9', '#5b388f',
            '#546e91', '#8bde95', '#d2ab58', '#273c71', '#98bf6e', '#4daa4b', '#98abc5', '#cc1010', '#31383b', '#006391',
            '#c2643f', '#b0a474', '#a5a39c', '#a9c2bc', '#22af8c', '#7fcecf', '#987ac6', '#3d3b87', '#b77b1c', '#c9c2b6',
            '#807ece', '#8db27c', '#be66a2', '#9ed3c6', '#00644b', '#005064', '#77979f', '#77e079', '#9c73ab', '#1f79a7'
          ],
          segmentStroke: settings.borderColor ? settings.borderColor : '#ffffff'
        },
        canvasPadding: {
          top: 5,
          right: 5,
          bottom: 5,
          left: 5
        },
        gradient: {
          enabled: false,
          percentage: 95,
          color: '#000000'
        },
        cssPrefix: uniqueId
      },
      labels: {
        lines: {
          style: 'aligned'
        },
        outer: {
          format: 'label',
          hideWhenLessThanPercentage: null,
          pieDistance: pieDist,
          offsetSize: offsetSize
        },
        inner: {
          pieDistance: 10
        },
        mainLabel: {
          color: settings.labelsColor ? settings.labelsColor : '#333333',
          font: settings.labelsFont ? settings.labelsFont : 'arial',
          fontSize: settings.labelsSize ? settings.labelsSize : 10,
          minFontSize: settings.labelsMinFontSize,
          labelsInner: settings.labelsInner,
          horizontalPadding: 8,
          fontWeight: settings.labelsBold ? 'bold' : 'normal',
        }

      },
      tooltips: {
        enabled: true,
        type: 'placeholder', // caption|placeholder
        string: '',
        placeholderParser: null,
        styles: {
          fadeInSpeed: 1,
          backgroundColor: '#000000',
          backgroundOpacity: 0.5,
          color: '#efefef',
          borderRadius: 2,
          font: 'arial',
          fontSize: 10,
          padding: 4
        }
      },
      groups: {
        content: groupData,
        font: settings.groupsFont ? settings.groupsFont : 'arial',
        fontSize: settings.groupsSize ? settings.groupsSize : 10,
        fontColor: settings.groupsFontColor ? settings.groupsFontColor : '#333333',
        minFontSize: settings.groupLabelsMinFontSize,
        fontWeight: settings.groupsBold ? 'bold' : 'normal'
      }
    })
  }

  // getter/setter
  chart.values = function (v) {
    if (!arguments.length) return values
    values = v
    n = values.length
    return chart
  }

  chart.labels = function (v) {
    if (!arguments.length) return labels
    labels = v
    return chart
  }

  chart.settings = function (v) {
    if (!arguments.length) return settings
    settings = v
    return chart
  }

  // resize
  chart.resize = function (el) {
    resizeChart(el)
  }

  chart.width = function (v) {
    // width getter/setter
    if (!arguments.length) return width
    width = v
    return chart
  }

  // height getter/setter
  chart.height = function (v) {
    if (!arguments.length) return height
    height = v
    return chart
  }

  return chart
}

module.exports = function (element, width, height, stateChangedCallback) {
  const uniqueId = `rhtmlDonut-${uniqueDonutIdentifier++}`
  let outerSvg, title, subtitle, footer
  let donutPlot = DetailedDonutPlot(uniqueId)

  return {
    renderValue (inputConfig, userState) {
      $(element).find('*').remove()

      outerSvg = d3.select(element)
        .append('svg')
        .attr('class', 'svgContent')
        .attr('width', width)
        .attr('height', height)

      title = new Title(
        inputConfig.settings.title,
        inputConfig.settings.titleFontColor,
        inputConfig.settings.titleFontSize,
        inputConfig.settings.titleFontFamily,
        null,
        inputConfig.settings.titleTopPadding
      )

      subtitle = new Subtitle(
        inputConfig.settings.subtitle,
        inputConfig.settings.subtitleFontColor,
        inputConfig.settings.subtitleFontSize,
        inputConfig.settings.subtitleFontFamily,
        inputConfig.settings.title
      )

      footer = new Footer(
        inputConfig.settings.footer,
        inputConfig.settings.footerFontColor,
        inputConfig.settings.footerFontSize,
        inputConfig.settings.footerFontFamily,
        height
      )

      title.setX(width / 2)
      subtitle.setY(title.getSubtitleY())
      subtitle.setX(width / 2)
      footer.setX(width / 2)

      title.drawWith(uniqueId, outerSvg)
      subtitle.drawWith(uniqueId, outerSvg)
      footer.drawWith(uniqueId, outerSvg)

      const titleHeight = title.getHeight()
      const subtitleHeight = subtitle.getHeight()
      const footerHeight = footer.getHeight()

      donutPlot = donutPlot.width(width).height(height - titleHeight - subtitleHeight - footerHeight)
      donutPlot = donutPlot.settings(inputConfig.settings)
      donutPlot = donutPlot.values(inputConfig.values)
      donutPlot = donutPlot.labels(inputConfig.labels)

      d3.select(element).call(donutPlot)
    },

    resize (newWidth, newHeight) {
      d3.select(element).select('svg')
        .attr('width', newWidth)
        .attr('height', newHeight)

      title.setX(newWidth / 2)
      subtitle.setX(newWidth / 2)
      footer.setX(newWidth / 2)
      footer.setY(newHeight - footer.getHeight())

      title.drawWith(uniqueId, outerSvg)
      subtitle.drawWith(uniqueId, outerSvg)
      footer.drawWith(uniqueId, outerSvg)

      return donutPlot.width(newWidth).height(newHeight).resize(element)
    }
  }
}
