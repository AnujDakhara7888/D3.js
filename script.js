// Load the JSON dataset
d3.json("premierleaguedataset.json").then(premierleaguedataset => {

    // 1. Bar Chart
    let xVal = "Team";
    let yVal = "Goals";
    updateBarChart(xVal, yVal);
    
    document.getElementById("x-axis").addEventListener("change", function() {
        xVal = this.value;
        updateBarChart(xVal, yVal);
    });

    document.getElementById("y-axis").addEventListener("change", function() {
        yVal = this.value;
        updateBarChart(xVal, yVal);
    });

    // 2. Pie Chart
    let selectVal = "Position";
    updatePieChart(selectVal);
    
    document.getElementById("select-pie").addEventListener("change", function() {
        selectVal = this.value;
        updatePieChart(selectVal);
    });

    // 3. Scatter Plot
    let scatterPer = "Team";
    let xAx = "Goals";
    let yAx = "Assists";
    updateScatterPlot(scatterPer, xAx, yAx);

    document.getElementById("scatter-per").addEventListener("change", function() {
        scatterPer = this.value;
        updateScatterPlot(scatterPer, xAx, yAx);
    });

    document.getElementById("x-scatter").addEventListener("change", function() {
        xAx = this.value;
        updateScatterPlot(scatterPer, xAx, yAx);
    });

    document.getElementById("y-scatter").addEventListener("change", function() {
        yAx = this.value;
        updateScatterPlot(scatterPer, xAx, yAx);
    });

    function updateBarChart(xVal, yVal) {
        const data = processBarChartData(premierleaguedataset, xVal, yVal);

        d3.select("#chart").selectAll("svg").remove();

        const width = 1200;
        const height = 400;
        const marginTop = 20;
        const marginRight = 0;
        const marginBottom = 30;
        const marginLeft = 40;

        const x = d3.scaleBand()
            .domain(data.map(d => d.x))
            .range([marginLeft, width - marginRight])
            .padding(0.1);

        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.y)]).nice()
            .range([height - marginBottom, marginTop]);

        const svg = d3.select("#chart").append("svg")
            .attr("viewBox", [0, 0, width, height + 50])
            .attr("style", `max-width: ${width}px; height: auto; font: 10px sans-serif; overflow: visible;`);

        svg.append("g")
            .attr("fill", "steelblue")
            .selectAll("rect")
            .data(data)
            .join("rect")
            .attr("x", d => x(d.x))
            .attr("y", d => y(d.y))
            .attr("height", d => y(0) - y(d.y))
            .attr("width", x.bandwidth());

        svg.append("g")
            .attr("transform", `translate(0,${height - marginBottom})`)
            .call(d3.axisBottom(x).tickSizeOuter(0))
            .selectAll("text")
            .attr("transform", "rotate(45)")
            .style("text-anchor", "start")
            .attr("dx", "0.5em")
            .attr("dy", "0.5em");

        svg.append("g")
            .attr("transform", `translate(${marginLeft},0)`)
            .call(d3.axisLeft(y).tickFormat(y => y.toFixed()))
            .call(g => g.select(".domain").remove());
    }

    function updatePieChart(selectVal) {
        const data = processPieChartData(premierleaguedataset, selectVal);

        d3.select("#pie-chart").selectAll("svg").remove();

        const width = 928;
        const height = Math.min(width, 500);

        const color = d3.scaleOrdinal()
            .domain(data.map(d => d.name))
            .range(d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), data.length).reverse());

        const pie = d3.pie()
            .sort(null)
            .value(d => d.value);

        const arc = d3.arc()
            .innerRadius(0)
            .outerRadius(Math.min(width, height) / 2 - 1);

        const labelRadius = arc.outerRadius()() * 0.8;
        const arcLabel = d3.arc().innerRadius(labelRadius).outerRadius(labelRadius);

        const arcs = pie(data);

        const svg = d3.select("#pie-chart").append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("viewBox", [-width / 2, -height / 2, width, height])
            .attr("style", "max-width: 100%; height: auto; font: 10px sans-serif;");

        svg.append("g")
            .attr("stroke", "white")
            .selectAll("path")
            .data(arcs)
            .join("path")
            .attr("fill", d => color(d.data.name))
            .attr("d", arc)
            .append("title")
            .text(d => `${d.data.name}: ${d.data.value}`);

        svg.append("g")
            .attr("text-anchor", "middle")
            .selectAll("text")
            .data(arcs)
            .join("text")
            .attr("transform", d => `translate(${arcLabel.centroid(d)})`)
            .call(text => text.append("tspan")
                .attr("y", "-0.4em")
                .attr("font-weight", "bold")
                .text(d => d.data.name))
            .call(text => text.filter(d => (d.endAngle - d.startAngle) > 0.25).append("tspan")
                .attr("x", 0)
                .attr("y", "0.7em")
                .attr("fill-opacity", 0.7)
                .text(d => d.data.value));
    }

    function updateScatterPlot(scatterPer, xAx, yAx) {
        d3.select("#scatter-plot").selectAll("svg").remove();
    
        const width = 1200;
        const height = 600;
        const margin = { top: 20, right: 150, bottom: 50, left: 50 };
    
        const svg = d3.select("#scatter-plot").append("svg")
            .attr("width", width+100)
            .attr("height", height)
            .attr("viewBox", [0, 0, width, height]);
    
        const x = d3.scaleLinear()
            .domain(d3.extent(premierleaguedataset, d => d[xAx])).nice()
            .range([margin.left, width - margin.right]);
    
        const y = d3.scaleLinear()
            .domain(d3.extent(premierleaguedataset, d => d[yAx])).nice()
            .range([height - margin.bottom, margin.top]);
    
        const color = d3.scaleOrdinal(d3.schemeCategory10)
            .domain(premierleaguedataset.map(d => d[scatterPer]));
    
        // Add x-axis with grid lines
        svg.append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .call(d3.axisBottom(x).ticks(width / 80))
            .call(g => g.select(".domain").remove()) // Remove axis line
            .call(g => g.selectAll(".tick line")
                .attr("y2", -height + margin.top + margin.bottom) // Create vertical grid lines
                .attr("stroke-opacity", 0.2) // Make grid lines visible
            );
    
        // Add y-axis with grid lines
        svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .call(d3.axisLeft(y))
            .call(g => g.select(".domain").remove()) // Remove axis line
            .call(g => g.selectAll(".tick line")
                .attr("x2", width - margin.left - margin.right) // Create horizontal grid lines
                .attr("stroke-opacity", 0.2) // Make grid lines visible
            );
    
        // Add scatterplot dots
        svg.append("g")
            .selectAll("circle")
            .data(premierleaguedataset)
            .join("circle")
            .attr("cx", d => x(d[xAx]))
            .attr("cy", d => y(d[yAx]))
            .attr("r", 5)
            .attr("fill", d => color(d[scatterPer]))
            .append("title")
            .text(d => `Player: ${d.Player}\nTeam: ${d.Team}\nPosition: ${d.Position}\nAge: ${d.Age}\n${xAx}: ${d[xAx]}\n${yAx}: ${d[yAx]}`);
    
        // Add legend
        const legend = svg.selectAll(".legend")
            .data(color.domain())
            .join("g")
            .attr("class", "legend")
            .attr("transform", (d, i) => `translate(${width - margin.right + 20},${i * 20})`);
    
        legend.append("rect")
            .attr("x", 0)
            .attr("width", 18)
            .attr("height", 18)
            .attr("fill", color);
    
        legend.append("text")
            .attr("x", 24)
            .attr("y", 9)
            .attr("dy", "0.35em")
            .text(d => d);
    }    
    
    function processBarChartData(premierleaguedataset, xVal, yVal) {
        let result = [];
        let data = {};

        premierleaguedataset.forEach(player => {
            let key = player[xVal];
            let value = player[yVal];

            if (!data[key]) {
                data[key] = 0;
            }

            data[key] += value;
        });

        for (let key in data) {
            result.push({ x: key, y: data[key] });
        }

        return result;
    }

    function processPieChartData(premierleaguedataset, selectVal) {
        let positionData = { FW: 0, DF: 0, MF: 0, GK: 0 };
        let ageData = {};
        let nationData = {};

        premierleaguedataset.forEach(player => {
            let positions = player.Position.split(",");
            if (positions.includes("FW")) positionData.FW++;
            if (positions.includes("DF")) positionData.DF++;
            if (positions.includes("MF")) positionData.MF++;
            if (positions.includes("GK")) positionData.GK++;

            let age = player.Age;
            if (age >= 15 && age <= 19) ageData["15-19"] = (ageData["15-19"] || 0) + 1;
            else if (age >= 20 && age <= 24) ageData["20-24"] = (ageData["20-24"] || 0) + 1;
            else if (age >= 25 && age <= 29) ageData["25-29"] = (ageData["25-29"] || 0) + 1;
            else if (age >= 30 && age <= 34) ageData["30-34"] = (ageData["30-34"] || 0) + 1;
            else if (age >= 35) ageData["35+"] = (ageData["35+"] || 0) + 1;

            let nation = player.Nation.split(" ")[1];
            nationData[nation] = (nationData[nation] || 0) + 1;
        });

        let sortedNations = Object.entries(nationData).sort((a, b) => b[1] - a[1]);
        let top5Nations = sortedNations.slice(0, 5).map(([name, value]) => ({ name, value }));
        let otherNationsCount = sortedNations.slice(5).reduce((sum, [, value]) => sum + value, 0);
        if (otherNationsCount > 0) {
            top5Nations.push({ name: "Others", value: otherNationsCount });
        }

        let ageArray = Object.entries(ageData).map(([name, value]) => ({ name, value }));
        let positionArray = Object.entries(positionData).map(([name, value]) => ({ name, value }));

        return {
            Position: positionArray,
            Age: ageArray,
            Nation: top5Nations
        }[selectVal];
    }
});
