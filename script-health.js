let margin = 5;

window.onload = function () {
    // window.addEventListener("resize", onWindowResize());
    d3.csv('data/data-other.csv').then(d => {
        let cat_dict = {};
        let cat = "Health";
        //find sub categories for each of our categories
        let sub_categories = d.filter(e => e.Category === cat).map(e => e.Sub_Category);
        // only get the unique ones
        let sub_cat_unique = [...new Set(sub_categories)];
        cat_dict[cat] = {};
        for (let sc of sub_cat_unique) {
            cat_dict[cat][sc] = sub_categories.filter(s => s === sc).length
        }
        console.log(cat_dict);
        make_pie(cat, cat_dict[cat]);
        // make_legend(cat, cat_dict[cat]);
    });
    // $(window).on('resize', handleResize)

};

function make_pie(cat, data) {
    let width = window.innerWidth
    let height = window.innerHeight;
    // let height = width;
    let radius = (Math.min(width, height)/3) - margin;
    let sum = Object.values(data).reduce((a, b) => a + b, 0); //total number of iqps in this category

    let svg = d3.select("#viz")
        .append("svg")
        .attr('class', 'svg-' + cat)
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + 0 + ", " + window.innerHeight / 2 + ")");


    // let color = d3.scaleSequential(d3.interpolateCool);
    let color = d3.scaleSequential(d3.interpolateHcl('#ddc3bd','#b40005'));


    let pie = d3.pie()
        .value(d => d.value);


    let data_ready = pie(d3.entries(data));

    let arc = d3.arc()
        .innerRadius(0)
        .outerRadius(radius);

    svg
        .selectAll('.viz-' + cat)
        .data(data_ready)
        .enter()
        .append('path')
        .attr('class', 'path-' + cat)
        .attr('d', arc)
        .attr('fill', d => color(3.2 * d.data.value / sum))
        .attr("stroke", "white")
        .style("stroke-width", "4px")
        .style("opacity", 0.8)


    //LABELS HERE

    // arcs for positioning labels
    var innerArc = d3.arc()
        .innerRadius(radius/2)
        .outerRadius(radius);

    let outerradius = radius * 1.5
    var outerArc = d3.arc()
        .innerRadius(radius/2)
        .outerRadius(outerradius);

    // Add the polylines between chart and labels:
    svg
        .selectAll('allPolylines')
        .data(data_ready)
        .enter()
        .append('polyline')
        .attr("stroke", "black")
        .attr('stroke-opacity', 0.5)
        .style('stroke-linecap', "round")
        .style("fill", "none")
        .attr("stroke-width", 3)
        .attr('points', function (d) {
            var posA = innerArc.centroid(d); // line insertion in the slice
            var posB = outerArc.centroid(d); // line break: we use the other arc generator that has been built only for that
            var posC = outerArc.centroid(d); // Label position = almost the same as posB
            var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2; // we need the angle to see if the X position will be at the extreme right or extreme left
            posC[0] = outerradius / 1.3 * (midangle < Math.PI ? 1 : -1); // multiply by 1 or -1 to put it on the right or on the left
            return [posA, posB, posC]
        });

// Add the label text
    svg
        .selectAll('allLabels')
        .data(data_ready)
        .enter()
        .append('text')
        .attr('font-size', '1em')
        .style('fill', 'grey')
        .text(function (d) {
            return d.data.key + " (" + d.data.value + ")"
        })
        .attr('transform', function (d) {
            var pos = outerArc.centroid(d);
            var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
            pos[0] = outerradius /1.2 * (midangle < Math.PI ? 1 : -1);
            return 'translate(' + pos[0]+","+ (pos[1]+8) + ')';
        })
        .style('text-anchor', function (d) {
            var midangle = d.startAngle + (d.endAngle - d.startAngle) / 2;
            return (midangle < Math.PI ? 'start' : 'end')
        });

    svg
        .attr("transform", "translate(" + width / 1.8 + ", "+height/2+")");


    // svg.selectAll('lines')
    //     .attr('transform', 'translate('+window.innerWidth/2+", "+0+")")
    //
    // svg.selectAll('labels')
    //     .attr('transform', 'translate('+radius+", "+0+")")


    // Now add the annotation. Use the centroid method to get the best coordinates

    // let labelArc = d3.arc()
    //     .outerRadius(radius - radius / 10)
    //     .innerRadius(radius - radius / 100);
    //
    // svg
    //     .selectAll('.viz-' + cat)
    //     .data(data_ready)
    //     .enter()
    //     .append("text")
    //     .text(d => d.data.key + " (" + d.data.value + ")")
    //     .attr("transform", function (d) {
    //         // let midAngle = d.endAngle < Math.PI ? (d.startAngle / 2) + (d.endAngle / 2) : (d.startAngle / 2) + (d.endAngle / 2) + Math.PI;
    //         let centroid = arcGenerator.centroid(d);
    //         return "translate(" + ((width / 2) + centroid[0]) + "," + centroid[1] + ")";
    //     })
    //     // .attr("transform", function (d) {
    //     //     let midAngle = d.endAngle < Math.PI ? (d.startAngle / 2) + (d.endAngle / 2) : (d.startAngle / 2) + (d.endAngle / 2) + Math.PI;
    //     //     let centroid = arcGenerator.centroid(d);
    //     //     return "translate(" + ((width / 2) + centroid[0]) + "," + centroid[1] + ") rotate(-90) rotate(" + (midAngle * 180 / Math.PI) + ")";
    //     // })
    //     .attr("dy", ".35em")
    //     .style("text-anchor", "middle")
    //     .style("font-size", '0.9em')
}
