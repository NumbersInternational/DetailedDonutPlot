% Generated by roxygen2: do not edit by hand
% Please edit documentation in R/rhtmlDonut.R
\name{Donut}
\alias{Donut}
\title{Create a Donut plot}
\usage{
Donut(
  values,
  labels,
  values.color = NULL,
  values.order = "descending",
  values.font.family = "arial",
  values.font.size = 10,
  values.decimal.places = 1,
  values.display.as = "percentage",
  values.display.thres = 0.003,
  labels.enabled = TRUE,
  labels.font.family = "arial",
  labels.font.color = "#333333",
  labels.font.size = 10,
  labels.min.font.size = 8,
  labels.padding.inner = 1,
  labels.padding.outer = 1,
  labels.max.width = 0.3,
  labels.max.lines = 6,
  labels.offset = 0.1,
  labels.advanced.offset.yaxis.max = NULL,
  labels.advanced.liftoff.angle = 30,
  labels.advanced.line.max.angle = 80,
  labels.outer.lines.straightMin = 360,
  labels.outer.lines.straightMax = 360,
  labels.outer.lines.basisInterpolatedMin = 360,
  labels.outer.lines.basisInterpolatedMax = 360,
  labels.outer.lines.bezierMin = 0,
  labels.outer.lines.bezierMax = 360,
  labels.outer.lines.bezierSegmentLean = 0,
  labels.outer.lines.bezierLabelLean = 0,
  labels.outer.lines.bezierSegmentPullInProportionMin = 0.25,
  labels.outer.lines.bezierSegmentPullInProportionMax = 0.75,
  tooltips.max.width = 0.3,
  tooltips.max.height = 0.3,
  tooltips.font.family = "Arial",
  tooltips.font.size = 10,
  tooltips.font.color = NULL,
  tooltips.bg.color = NULL,
  tooltips.bg.opacity = 0.8,
  groups = NULL,
  groups.color = NULL,
  groups.order = "initial",
  groups.font.family = "arial",
  groups.font.color = "#333333",
  groups.font.size = 10,
  groups.min.font.size = 8,
  groups.labels.enabled = TRUE,
  labels.inner = FALSE,
  footer = "",
  footer.font.family = "Arial",
  footer.font.size = 8,
  footer.font.color = rgb(44, 44, 44, maxColorValue = 255),
  title = NULL,
  title.font.family = "arial",
  title.font.size = 16,
  title.font.color = "#333333",
  title.top.padding = 0,
  subtitle = "",
  subtitle.font.family = "Arial",
  subtitle.font.size = 12,
  subtitle.font.color = rgb(44, 44, 44, maxColorValue = 255),
  prefix = NULL,
  suffix = NULL,
  border.color = "#ffffff",
  gradient = FALSE,
  inner.radius = 0.8,
  log.level = "info",
  canvas.size.min = 50,
  canvas.size.labels.min = 100
)
}
\arguments{
\item{values}{vector of real numbers}

\item{labels}{character vector, length must be the same as \code{values}}

\item{values.color}{(optional) colors for \code{values}. If not provided then default colors are generated. If \code{groups} are provided or \code{gradient} set to \code{FALSE}, then generate colors using D3 library. If \code{groups} not provided, then can generate gradient colors when \code{gradient} is \code{TRUE}.}

\item{values.order}{(optional) ordering of \code{values} = c("descending", "initial", "alphabetical"). The default is "descending".}

\item{values.font.family}{Font family of values.}

\item{values.font.size}{Font size of values.}

\item{values.decimal.places}{(optional) non-negative integer. Number of decimal places for \code{values} and group values (if \code{groups} exists).}

\item{values.display.as}{(optional) choice of c("percentage", "original"). If "percentage" then values are converted to percentages. If "original" display the original data. The default is "percentage".}

\item{values.display.thres}{(optional) threshold of the minimum value in percentage that will have a label attached. Range is [0,1] and he default is 0.003.}

\item{labels.enabled}{(optional) enable / disable outer labels. The default is TRUE.}

\item{labels.font.family}{(optional) font family for \code{labels}. The default is "Arial"}

\item{labels.font.color}{(optional) a hex value to set the font color for \code{labels}. The default is "#333333".}

\item{labels.font.size}{(optional) desired font size in pixels for \code{labels}. The default is 10.}

\item{labels.min.font.size}{(optional) the minimum font size in pixels for labels. The default is 8.}

\item{labels.padding.inner}{(optional) Exact Padding between rows in a multi line label. Default is 1.}

\item{labels.padding.outer}{(optional) Padding between different labels. Default is 1.}

\item{labels.max.width}{(optional) the maximum label width as a proportion of total width. The default is 0.3.}

\item{labels.max.lines}{(optional) the maximum number of vertical lines to allow when wrapping labels. The default is 6.}

\item{labels.offset}{(optional) the initial distance between outer radius and label placement, before adjustments, expressed as a proportion of the outer radius. The default is 0.1.}

\item{labels.advanced.offset.yaxis.max}{(optional) At top and bottom of donut, labels begin to lift off (based on labels.advanced.liftoff.angle). labels.advanced.offset.yaxis.max controls the max offset (measured at 90 degrees) from the outerRadius. Default value is 100 (pixels).}

\item{labels.advanced.liftoff.angle}{(optional) labels begin to pull away from the donut at this label, to alleviate crowding in the lower and upper regions of the pie. This setting controls the threshold where this occurs. The angle is computed between the radial line through the segment midpoint and the yaxis origin line. The default is 30.}

\item{labels.advanced.line.max.angle}{(optional) Labels are hidden if the angle between the labelLine and the radial line through the segment midpoint is greater than labels.advanced.line.max.angle. The default is 60.}

\item{labels.outer.lines.straightMin}{TODO document}

\item{labels.outer.lines.straightMax}{TODO document}

\item{labels.outer.lines.basisInterpolatedMin}{TODO document}

\item{labels.outer.lines.basisInterpolatedMax}{TODO document}

\item{labels.outer.lines.bezierMin}{TODO document}

\item{labels.outer.lines.bezierMax}{TODO document}

\item{labels.outer.lines.bezierSegmentLean}{TODO document}

\item{labels.outer.lines.bezierLabelLean}{TODO document}

\item{labels.outer.lines.bezierSegmentPullInProportionMin}{TODO document}

\item{labels.outer.lines.bezierSegmentPullInProportionMax}{TODO document}

\item{tooltips.max.width}{(optional) the maximum tooltip width as a proportion of total width. The default is 0.3.}

\item{tooltips.max.height}{(optional) the maximum tooltip height as a proportion of total height. The default is 0.3.}

\item{tooltips.font.family}{(optional) font family for tooltips. The default is "Arial".}

\item{tooltips.font.size}{(optional) font size for tooltips. The default is 10.}

\item{tooltips.font.color}{(optional) font hex color for tooltips. The default is NULL. If set to NULL, the color will be set to black or white automatically based on the background color.}

\item{tooltips.bg.color}{(optional) hex color code. The default is NULL. If set to NULL, the background color is the same as the segment.}

\item{tooltips.bg.opacity}{(optional) tooltip background opacity. A value between 0 and 1. Default is 0.8.}

\item{groups}{(optional) character vector that specifies the group of \code{values}. Length must be the same as \code{values}. If this is set, the inner region of the pie will be filled to indicate groups.}

\item{groups.color}{(optional) colors for \code{groups}. If not provided then D3 colors are generated.}

\item{groups.order}{(optional) ordering of \code{groups} = c("descending", "initial", "alphabetical"). The default is "descending".}

\item{groups.font.family}{(optional) font family for \code{groups}. The default is "Arial".}

\item{groups.font.color}{(optional) a hex value to set the font color for \code{groups}. The default is "#333333".}

\item{groups.font.size}{(optional) desired font size in pixels for \code{groups}. The default is 10.}

\item{groups.min.font.size}{(optional) the minimum font size in pixcels for \code{groups}. The default is 8.}

\item{groups.labels.enabled}{(optional) enable / disable group labels. The default is TRUE.}

\item{labels.inner}{(optional) boolean. if \code{TRUE} then add inner labels to the pie only if both of these conditions are satisfied: (1) no \code{groups} and (2) \code{values.order} is "descending". The default is \code{FALSE}.}

\item{footer}{is the footer text given at the bottom at the plot}

\item{footer.font.family}{is the font of the footer text}

\item{footer.font.size}{is the font size of the footer text}

\item{footer.font.color}{is the font color of the footer text}

\item{title}{(optional) specifies the title text.}

\item{title.font.family}{(optional) specifies the font family of the title. The default is "arial".}

\item{title.font.size}{(optional) specifies the font size of the title in pixels. The default is 16.}

\item{title.font.color}{(optional) a hex value to specify the color of the title. The default is "#333333".}

\item{title.top.padding}{(optional) integer to set padding for the title. Defaults to 0.}

\item{subtitle}{is the subtitle text given to the plot}

\item{subtitle.font.family}{is the font of the subtitle text}

\item{subtitle.font.size}{is the font size of the subtitle text}

\item{subtitle.font.color}{is the font color of the subtitle text}

\item{prefix}{(optional) character, prefix for \code{labels}}

\item{suffix}{(optional) character, suffix for \code{labels}}

\item{border.color}{(optional) hex value, or "none"}

\item{gradient}{(optional) if \code{groups} is not provided, set this parameter to \code{TRUE} will generate gradient colors for \code{values} if \code{values.color} is not provided.}

\item{inner.radius}{(optional) specifies the pie inner radius as a proportion of the outer radius. Range is [0,1). Default is 0.8.}

\item{log.level}{(optional) specifies logging verbosity. Default is "info". Options as ["debug", "info", "warn", "error"].}

\item{canvas.size.min}{(optional). Specifies minimum canvas size to draw a donut. Both height and width must meet or exceed min. Defaults to 50.}

\item{canvas.size.labels.min}{(optional). Specifies minimum canvas size to draw labels on donut. Both height and width must meet or exceed min. Defaults to 100.}
}
\value{
a donut plot
}
\description{
Create a Donut plot
}
\examples{
# load example data
data("browser", package = "rhtmlDonut")
# select a smaller subset
out = sort(values, decreasing = TRUE, index.return = TRUE)
values1 = out[[1]][1:30]
labels1 = labels[out[[2]]][1:30]
groups1 = groups[out[[2]]][1:30]
# a donut plot
rhtmlDonut::Donut(values = values1,
                 labels = labels1,
                 values.order = "descending",
                 prefix = "", suffix = "\%")
rhtmlDonut::Donut(values = values1,
                 labels = labels1,
                 values.order = "descending",
                 gradient = TRUE,
                 border.color = "#FF0000",
                 prefix = "", suffix = "\%")
# a donut plot with groups
rhtmlDonut::Donut(values = values1,
                 labels = labels1,
                 groups = groups1,
                 prefix = "", suffix = "\%")
}
