import React, {useEffect} from 'react';
import {mapKeys} from 'lodash';
import * as d3 from 'd3';

import './App.css';

const width = 600;
const height = 400;
const margin = {
    top: 20,
    right: 20,
    bottom: 30,
    left: 50
};


const api =
    'https://api.coindesk.com/v1/bpi/historical/close.json?start=2017-12-31&end=2019-12-31';

function App() {

    useEffect(() => {
        const SVG = d3.select('.App').append('svg').attr('width', width).attr('height', height);

        const g = SVG.append('g').attr('transform', `translate(${margin.left}, ${margin.top})`);

        fetch(api)
            .then((data) => data.json())
            .then(({bpi}) => {

                const dates: Date[] = [];
                const values: number[] = [];
                const data: Array<{date:Date, value: number}> = []
                const dataLine: any = [];

                mapKeys(bpi, (value, key) => {
                    const date = new Date(key);

                    dates.push(new Date(key));
                    values.push(value);

                    dataLine.push([new Date(key), value])
                    data.push({
                        date,
                        value,
                    })
                });

                const xData = d3.extent(data,data => data.value);
                const yData = d3.extent(data,data => data.date);

                const yScale = d3.scaleLinear()
                    .domain(xData[0] ? xData : [0,0])
                    .range([0, height - margin.bottom - margin.top]);

                const xScale = d3.scaleTime()
                    .domain(yData[0] ? yData : [0,0])
                    .range([0, width - margin.left - 2]);

                const xAxis = d3.axisLeft(yScale);
                const yAxis = d3.axisBottom(xScale);

                const line = d3.line()
                    .x((d) => d[1])
                    .y((d) => d[0])
                    .curve(d3.curveCatmullRom.alpha(1));

                const mapData = dataLine.map((data:any) => [ yScale(data[1]),xScale(data[0])]);

                const xAxisDraw = SVG.append('g').attr('transform', `translate(${margin.left},${margin.top})`).call(xAxis);
                const yAxisDraw = SVG.append('g').attr('transform', `translate(${margin.left},${height - margin.bottom})`).call(yAxis);

                const crop = SVG.append('defs')
                    .append('SVG:clipPath')
                    .attr('id', 'crop')
                    .append('SVG:rect')
                    .attr('width', width)
                    .attr('height', height - margin.bottom - margin.top)
                    .attr('x', 0)
                    .attr('y', 0);

                const drawGraphic = SVG.append('g')
                    .append('path')
                    .attr('fill','none')
                    .attr('stroke','red')
                    .attr('d', line(mapData) || '')
                    .attr('transform',`translate(${margin.left + 1},${margin.top})`)
                    .attr('clip-path', 'url(#crop)');

                const updateChart = () => {
                    const newX = d3.event.transform.rescaleY(yScale);
                    const newY = d3.event.transform.rescaleX(xScale);

                    xAxisDraw.call(d3.axisLeft(newX));
                    yAxisDraw.call(d3.axisBottom(newY));

                    const mapZoomData = dataLine.map((data:any) => [newX(data[1]),newY(data[0])]);

                    drawGraphic.attr('d', line(mapZoomData) || '')
                };

                const zoomer = d3
                    .zoom()
                    .scaleExtent([0, 100])
                    .extent([
                        [0, 0],
                        [width, height],
                    ])
                    .on('zoom', updateChart);



                SVG.call(zoomer as any)
            });


    }, []);


    return (
        <div className="App">

        </div>
    );
}

export default App;
