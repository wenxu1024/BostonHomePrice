$(function() {
    // set the dimensions and margins of the graph
    var margin = {top: 50, right: 50, bottom: 70, left: 50},
        chartwidth = d3.select('#choropleth').node().offsetWidth,
        chartheight = d3.select('#choropleth').node().offsetHeight,
        width = chartwidth - margin.left - margin.right,
        height = chartheight - margin.top - margin.bottom;
    var svg = d3.select("#choropleth")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

    // D3 Projection
    var projection = d3.geoAlbers()
        .scale( 30000 )
        .rotate( [71.257,0] )
        .center( [0, 42.433] )
        .translate( [width / 2,height / 2]);

    // Define path generator
    var path = d3.geoPath() // path generator that will convert GeoJSON to SVG paths
        .projection(projection); // tell path generator to use albersUsa projection

    var domain = "http://127.0.0.1:8000/";
    var api = "api/avghomes";
    var url = domain + api;

    chartheight = chartheight / 2;
    height = chartheight - margin.top - margin.bottom;
    var townpricedist = d3.select("#townpricedist")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

    // add the x Axis
    var priceXScale = d3.scaleLinear().domain([100000,2000000]).range([0, width]);
    var pricedistx = d3.axisBottom(priceXScale);

    townpricedist.append("g")
      .attr("transform", "translate(0," + height + ")")
      .attr("class", "x axis")
      .call(pricedistx);

    // text label for the x axis
    townpricedist.append("text")
      .attr("transform",
            "translate(" + (width/2) + " ," +
                           (height + margin.top ) + ")")
      .style("text-anchor", "middle")
      .text("Last Sold Price ($)");

    var townpricedistgroup = townpricedist.append("g");

    // add the y Axis
    var priceyScale = d3.scaleLinear().range([height, 0]).domain([0, 0]);
    var pricedisty = d3.axisLeft(priceyScale);

    townpricedist.append("g")
        .attr("class", "y axis")
        .call(pricedisty);


    // text label for the y axis
    townpricedist.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left - 5)
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Count");


    var townselldist = d3.select("#townselldist")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");




    // add the x Axis
    var sellXScale = d3.scaleTime().domain([new Date(2019,4,1),new Date(2020,7,1)]).range([0, width]);
    var selldistx = d3.axisBottom(sellXScale);

    townselldist.append("g")
      .attr("transform", "translate(0," + height + ")")
      .attr("class", "x axis")
      .call(selldistx)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", "rotate(-35)");;

    // text label for the x axis
    townselldist.append("text")
      .attr("transform",
            "translate(" + (width/2) + " ," +
                           (height + margin.top + 15) + ")")
      .style("text-anchor", "middle")
      .text("Last Sold Date");

    // add the y Axis
    var sellYScale = d3.scaleLinear().domain([0, 0]).range([height, 0])
    var selldisty = d3.axisLeft(sellYScale);

    townselldist.append("g")
        .attr("class", "y axis")
        .call(selldisty);

    // text label for the y axis
    townselldist.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left - 5)
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Count");

    var townselldistgroup = townselldist.append("g");

    // set the parameters for the histogram
  var histogram = d3.histogram()
      .value(function(d) { return +d.lastsoldprice; })   // I need to give the vector of value
      .domain(priceXScale.domain())  // then the domain of the graphic
      .thresholds(priceXScale.ticks(40)); // then the numbers of bins



    var tooltip = d3.select('body')
                    .append('div')
                    .attr('id', 'tooltip')
                    .attr('style', 'position: absolute; opacity: 0;');

    var linebreak = "<br/>";

    $.getJSON(url, function(avghomeprices) {
        var myColor = d3.scaleOrdinal().domain(avghomeprices.map(function(d) {return d.city.toLowerCase();}))
                        .range(d3.schemeCategory10);

        d3.json("static/assets/mass.json").then(function(geojson) {
            merge(geojson, avghomeprices);
            draw_map(geojson);




            //function merge geojson and avghomeprices
            function merge(geojson, avghomeprices) {
                //add selected attribute
                geojson.features.forEach(function(d) {
                    d.properties.selected = false;
                })
                //merge geojson and avghomeprices
                var i = 0;
                var j = 0;
                for(i = 0; i < geojson.features.length; i ++) {
                    var jsoncity = geojson.features[i].properties.TOWN.toLowerCase();
                    for(j = 0; j < avghomeprices.length; j ++) {
                        var city = avghomeprices[j].city.toLowerCase();
                        var avgsoldprice = avghomeprices[j].avgsoldprice;
                        if (city == jsoncity) {
                            geojson.features[i].properties.value = avgsoldprice;
                            break;
                        }
                    }
                    if(j == avghomeprices.length) {
                        geojson.features[i].properties.value = 0;
                    }
                }
            }


            //function draw map
            function draw_map(geojson) {

                var lowColor = '#f9f9f9'
                var highColor = '#bc2a2a'
                var minVal = d3.min(avghomeprices, d=>d.avgsoldprice);
                var maxVal = d3.max(avghomeprices, d=>d.avgsoldprice);
                var ramp = d3.scaleLinear().domain([minVal,maxVal]).range([lowColor,highColor])


                var townpath = svg.selectAll("path")
                    .data(geojson.features)

                townpath.enter()
                    .append("path")
                    .merge(townpath)
                    .attr("d", path)
                    .style("stroke", function(d) {
                        if (d.properties.selected) return "#090808";
                        else return "#f9f9f9";
                    })
                    .style("stroke-width", function(d) {
                        if (d.properties.selected) return 5;
                        else return 1;
                    })
                    .style("fill", function(d) { return ramp(d.properties.value) })
                    .on("mouseover",function(d) {
                        tooltip.transition().duration(200).style("opacity", 0.9);
                        tooltip.html("Town name:" + d.properties.TOWN + linebreak +
                            "Average Sold Price: $" + Math.round(d.properties.value))
                        .style("left", (d3.event.pageX + 30) + "px")
                        .style("top", (d3.event.pageY - 28) + "px");
                    })
                    .on("mouseout", function(d) {
                        tooltip.transition().duration(500).style("opacity", 0);
                    })
                    .on("click", town_click_handler);
                townpath.exit().remove();
            }

            var alldata = [];
            var added = {};
            var name_to_idx = {};
            var idx_to_name = {};
            var idx = 0;

            //function handler for map click
            function town_click_handler(d, i) {
                var townname = d.properties.TOWN;
                var temp = geojson.features.map(function(d2) {
                    if(d2.properties.TOWN == townname) {
                        d2.properties.selected = !d2.properties.selected;
                    }
                    return d2;
                })
                geojson.features = temp;
                draw_map(geojson);
                api = "api/homes?city=" + d.properties.TOWN;
                url = domain + api;
                $.getJSON(url, function(data) {
                    if(!added.hasOwnProperty(townname)) {
                        added[townname] = true;
                        alldata.push(data);
                        name_to_idx[townname] = idx;
                        idx_to_name[idx] = townname;
                        idx += 1;
                    }
                    else {
                        added[townname] = !added[townname];
                    }

                    draw_price_hist(alldata, added, name_to_idx, idx_to_name);
                    draw_sell_dist(alldata, added, name_to_idx, idx_to_name);






                    //function draw townpricehist
                    function draw_price_hist(alldata, added, name_to_idx, idx_to_name) {
                        var filterdata = alldata.filter(function(d, idx) {return added[idx_to_name[idx]];})
                        var pricedist = townpricedistgroup.selectAll('g').data(filterdata)
                        var maxy = d3.max(filterdata.map(function(d) {
                            return d3.max(histogram(d).map(function(d2) {return d2.length}))
                        }));
                        priceyScale.domain([0, maxy]);
                        townpricedist.selectAll("g.y.axis")
                            .call(pricedisty);
                        pricedist.enter()
                            .append('g')
                            .merge(pricedist)
                            .each(function(d) {
                                var bins = histogram(d);
                                var hist = d3.select(this).selectAll('rect').data(bins);
                                hist.enter()
                                    .append('rect')
                                    .merge(hist)
                                    .attr("x", 1)
                                    .attr("transform", function(d2) { return "translate(" + priceXScale(d2.x0) + "," + priceyScale(d2.length) + ")"; })
                                    .attr("width", function(d2) { return priceXScale(d2.x1) - priceXScale(d2.x0) - 1 ; })
                                    .attr("height", function(d2) { return height - priceyScale(d2.length); })
                                    .style("fill", function() {
                                        return myColor(d[0].city.toLowerCase());
                                    })
                                    .style("opacity", 0.6)
                                    .on("mouseover",function(d2) {
                                        tooltip.transition().duration(200).style("opacity", 0.9);
                                        tooltip.html("Price Range: $" + d2.x0 +"-" + "$" + d2.x1 + linebreak +
                                        "Count: " + d2.length)
                                        .style("left", (d3.event.pageX + 30) + "px")
                                        .style("top", (d3.event.pageY - 28) + "px");
                                    })
                                    .on("mouseout",function(d2) {
                                        tooltip.transition().duration(500).style("opacity", 0);
                                    })
                            })
                        pricedist.exit().remove();
                    }


                    //function draw sell by month data
                    function draw_sell_dist(alldata, added, name_to_idx, idx_to_name) {
                        var filterdata = alldata.filter(function(d, idx) {return added[idx_to_name[idx]];});
                        var selldist = townselldistgroup.selectAll('path').data(filterdata);
                        var maxy = d3.max(filterdata.map(function(d) {
                            var sellbydate = d3.nest().key(function(d2) {return new Date(d2.lastsolddate).setUTCDate(1);})
                                    .entries(d);
                            return d3.max(sellbydate.map(function(d2) {return d2.values.length;}))
                        }));
                        sellYScale.domain([0, maxy]);
                        townselldist.selectAll("g.y.axis")
                            .call(selldisty);

                        var selldots = townselldistgroup.selectAll('g').data(filterdata);
                        selldots.enter()
                            .append("g")
                            .merge(selldots)
                            .each(function(d) {
                                var sellbydate = d3.nest().key(function(d2) {return new Date(d2.lastsolddate).setUTCDate(1);})
                                    .rollup(function(v) { return v.length; })
                                    .entries(d);

                                var selldotsingle = d3.select(this).selectAll(".dot").data(sellbydate)
                                selldotsingle.enter()
                                    .append("circle")
                                    // Uses the enter().append() method
                                    .merge(selldotsingle)
                                    .attr("class", "dot") // Assign a class for styling
                                    .attr("cx", function(d2) { return sellXScale(d2.key) })
                                    .attr("cy", function(d2) { return sellYScale(d2.value) })
                                    .attr("r", 5)
                                    .style("fill", myColor(d[0].city.toLowerCase()))
                                    .on("mouseover", function(d2) {
  			                                //console.log(a)
                                            //this.attr('class', 'focus')
                                            tooltip.transition().duration(200).style("opacity", 0.9);
                                            tooltip.html("Time: " + new Date(parseInt(d2.key)).toDateString() + linebreak + "Count: " + d2.value)
                                            .style("left", (d3.event.pageX + 30) + "px")
                                            .style("top", (d3.event.pageY - 28) + "px");
		                                })
                                    .on("mouseout", function() {
                                        tooltip.transition().duration(500).style("opacity", 0);
                                    })

                                selldotsingle.exit().remove();

                            })
                        selldots.exit().remove();

                        selldist.enter()
                            .append("path")
                            .merge(selldist)
                            .each(function(d) {
                                var sellbydate = d3.nest().key(function(d2) {return new Date(d2.lastsolddate).setUTCDate(1);})
                                    .rollup(function(v) { return v.length; })
                                    .entries(d);

                                // 7. d3's line generator
                                var line = d3.line()
                                    .x(function(d2) {return sellXScale(d2.key); }) // set the x values for the line generator
                                    .y(function(d2) {return sellYScale(d2.value); }) // set the y values for the line generator
                                    .curve(d3.curveMonotoneX) // apply smoothing to the line
                                var sellline = d3.select(this);
                                sellline.datum(sellbydate) // 10. Binds data to the line
                                    .attr("class", "line") // Assign a class for styling
                                    .attr("d", line) // 11. Calls the line generator
                                    .style("stroke", function() {
                                        return myColor(d[0].city.toLowerCase());
                                    })


                            })

                        selldist.exit().remove();

                    }
                });
            }

    }).catch(function(error) {
        console.log(error);
    })
    })
});