const functionFilter = [
    {
        filter: new RegExp('^andarFrente(\\s+)?\\((\\s+)?\\d+(\\s+)?\\)(\\s+)?(;)?$'),
        type: 'sequential'
    },
    {
        filter: new RegExp('^andarTras(\\s+)?\\((\\s+)?\\d+(\\s+)?\\)(\\s+)?(;)?$'),
        type: 'sequential'
    },
    {
        filter: new RegExp('^girarEsquerda(\\s+)?\\((\\s+)?\\)(\\s+)?(;)?$'),
        type: 'sequential'
    },
    {
        filter: new RegExp('^girarDireita(\\s+)?\\((\\s+)?\\)(\\s+)?(;)?$'),
        type: 'sequential'
    },
    {
        filter: new RegExp('^darMeiaVolta(\\s+)?\\((\\s+)?\\)(\\s+)?(;)?$'),
        type: 'sequential'
    },
    {
        filter: new RegExp('^coletarCristal(\\s+)?\\((\\s+)?\\)(\\s+)?(;)?$'),
        type: 'normal'
    },
    {
        filter: new RegExp('^apagarFogo(\\s+)?\\((\\s+)?\\)(\\s+)?(;)?$'),
        type: 'mustCondition'
    },
    {
        filter: new RegExp('^se(\\s+)?\\((\\s+)?.+\\)$'),
        type: 'conditional'
    },
    {
        filter: new RegExp('^se(\\s+)?\\((\\s+)?.+\\)(\\s+)?{$'),
        type: 'conditional&&blockValidation'
    },
    {
        filter: new RegExp('^}$'),
        type: "closeBlockValidation"
    },
    {
        filter: new RegExp('^{$'),
        type: "blockValidation"
    }
];

const conditionalParameters = [
    new RegExp('true'),
    new RegExp('false'),
    new RegExp('^pegandoFogo(\\s+)?\\((\\s+)?\\)(\\s+)?$')
]

function ifValidation(line)
{
    let trimLine = line.trim()
    let condition = line.substring(trimLine.indexOf('(') + 1,trimLine.lastIndexOf(')'))
    for(let i = 0; i < conditionalParameters.length; i++)
    {
        if(conditionalParameters[i].test(condition.trim()))
        {
            return true
        }
        else
        {
            continue
        }
    }

    return false
}

function blockValidation(lines,index)
{
    let valid = false
    let ignoreClosure = 0
    for(let i = index + 1; i < lines.length; i++)
    {
        if(lines[i].includes('}'))
        {
            if(ignoreClosure == 0)
            {
                valid = true
                break
            }
            else
            {
                ignoreClosure--
            }
        }
        else if(lines[i].includes('{'))
        {
            ignoreClosure++
        }
        else
        {
            continue
        }
    }

    return valid
}

function closeBlockValidation(lines,index)
{
    let valid = false
    for(let i = index - 1; i >= 0;i--)
    {
        if(lines[i].includes('{'))
        {
            valid = true
            break
        }
        else
        {
            continue
        }
    }

    return valid
}

function mustConditionValidation(lines,index)
{
    let valid = false
    let completeCommonIf = new RegExp('^se(\\s+)?\\((\\s+)?.+\\)(\\s+)?(\\s+)?$')
    let commonIf = new RegExp('^se(\\s+)?\\((\\s+)?.+\\)$')
    let completeblockIf = new RegExp('^se(\\s+)?\\((\\s+)?.+\\)(\\s+)?{[^}]*?$')
    let blockIf = new RegExp('^se(\\s+)?\\((\\s+)?.+\\)(\\s+)?{$')

    let start = null
    for(let i = index - 1; i >= 0;i--)
    {
        if(commonIf.test(lines[i].trim()) || blockIf.test(lines[i].trim()))
        {
            start = i
            break
        }
        else
        {
            continue
        }   
    }

    if(start != null)
    {
        let codeTillFunction = ""
        for(let i = start; i < index;i++)
        {
            codeTillFunction += `${lines[i].trim()}\n`
        }
        if(completeCommonIf.test(codeTillFunction.trim()) || completeblockIf.test(codeTillFunction.trim()))
        {
            valid = true
            return valid
        }
        else
        {
            return valid
        }
    }
    else
    {
        return valid
    }
}

function predictFunction(lines,index)
{
    const directionFilter = [
        new RegExp('^andarFrente(\\s+)?\\((\\s+)?\\d+(\\s+)?\\)(\\s+)?(;)?$'),
        new RegExp('^andarTras(\\s+)?\\((\\s+)?\\d+(\\s+)?\\)(\\s+)?(;)?$'),
        new RegExp('^girarEsquerda(\\s+)?\\((\\s+)?\\)(\\s+)?(;)?$'),
        new RegExp('^girarDireita(\\s+)?\\((\\s+)?\\)(\\s+)?(;)?$'),
        new RegExp('^darMeiaVolta(\\s+)?\\((\\s+)?\\)(\\s+)?(;)?$')
    ];

    let position = [0,5];
    let axis = 0;
    let value = "+";
    let direction = 0;

    function calcDirection(direction)
    {
        const dirGuide = [
            {
                axis: 0,
                value: "+"
            },
            {
                axis: 1,
                value: "+"
            },
            {
                axis: 0,
                value: "-"
            },
            {
                axis: 1,
                value: "-"
            }
        ];

        return dirGuide[direction];
    }

    function correctRotation(index)
    {
        let i = index;
        if(i > 3)
        {
            return 0;
        }
        else if(i < 0)
        {
            return 3;
        }
        else
        {
            return i;
        }
    }

    for(let i = 0; i < index; i++)
    {
        if(directionFilter[0].test(lines[i]))
        {
            let amount = parseInt(lines[i].substring(lines[i].indexOf("(") + 1,lines[i].indexOf(")")))
            if(value == "+")
            {
                position[axis] += amount;
            }
            else
            {
                position[axis] -= amount;
            }
        }
        else if(directionFilter[1].test(lines[i]))
        {
            let amount = parseInt(lines[i].substring(lines[i].indexOf("(") + 1,lines[i].indexOf(")")))
            if(value == "-")
            {
                position[axis] += amount;
            }
            else
            {
                position[axis] -= amount;
            }   
        }
        else if(directionFilter[2].test(lines[i]))
        {
            direction--;
            direction = correctRotation(direction);
            const obj = calcDirection(direction);
            axis = obj.axis;
            value = obj.value;
        }
        else if(directionFilter[3].test(lines[i]))
        {
            direction++;
            direction = correctRotation(direction);
            const obj = calcDirection(direction);
            axis = obj.axis;
            value = obj.value;
        }
        else if(directionFilter[4].test(lines[i]))
        {
            direction--;
            direction = correctRotation(direction);
            direction--;
            direction = correctRotation(direction);
            const obj = calcDirection(direction);
            axis = obj.axis;
            value = obj.value; 
        }
        else
        {
            continue;
        }
    }

    if(value == '+')
    {
        position[axis]++;
    }
    else
    {
        position[axis]--;
    }

    return position;
}

function printError(text,line)
{
    const consoleElement = document.getElementById('consoleArea');
    consoleElement.innerText += `Código inválido: ${text} linha: ${line}\n`;
}

export default function parseCode(code,limit = 0)
{
    let codeParsed = "async function runCode(){\n";
    let badLuckFunctions = "\n";
    let lines = code.split('\n');
    let valid = true;
    let totalCommands = 0;
    for(let i = 0; i < lines.length;i++)
    {
        let validLine = false;
        let lineType;
        if(lines[i].trim() != "")
        {
            for(let j = 0; j < functionFilter.length;j++)
            {
                validLine = functionFilter[j].filter.test(lines[i].trim());
                if(validLine)
                {
                    lineType = functionFilter[j].type;
                    break;
                }
                else
                {
                    continue;
                }
            }

            if(validLine)
            {
                if(lineType === "sequential")
                {
                    let lineParsed = `await ${lines[i].trim()}\n`;
                    codeParsed += lineParsed;
                    totalCommands++;
                }
                else if(lineType === 'conditional&&blockValidation')
                {
                    let validConditional = false;
                    if(blockValidation(lines,i))
                    {
                        if(ifValidation(lines[i]))
                        {
                            validConditional = true;          
                        }
                        else
                        {
                            printError(`${lines[i]} (Condição inválida)`,i+1);
                        }   
                    }
                    else
                    {
                        printError(`${lines[i]} (Bloco é aberto mas nunca é fechado)`,i+1);   
                    }

                    if(validConditional)
                    {
                        let line = lines[i].trim();
                        let lineParsed = `if${line.substring(line.indexOf('('))}\n`;
                        codeParsed += lineParsed;   
                        totalCommands++;
                    }
                    else
                    {
                        valid = false;
                        break;
                    }
                }
                else if(lineType === 'conditional')
                {
                    if(ifValidation(lines[i]))
                    {
                        let line = lines[i].trim();
                        let lineParsed = `if${line.substring(line.indexOf('('))}\n`;
                        codeParsed += lineParsed;         
                        totalCommands++;
                    }
                    else
                    {
                        printError(`${lines[i]} (Condição inválida)`,i+1);
                        valid = false;
                        break;
                    }
                }
                else if(lineType === "blockValidation")
                {
                    if(blockValidation(lines,i))
                    {
                        let lineParsed = `${lines[i].trim()}\n`;
                        codeParsed += lineParsed;
                        totalCommands++;
                    }
                    else
                    {
                        printError(`${lines[i]} (Bloco é aberto mas nunca é fechado)`,i+1);
                        valid = false;
                        break;
                    }
                }
                else if (lineType === "closeBlockValidation")
                {
                    if(closeBlockValidation(lines,i))
                    {
                        let lineParsed = `${lines[i].trim()}\n`;
                        codeParsed += lineParsed;
                        totalCommands++;
                    }
                    else
                    {
                        printError(`${lines[i]} (Bloco é fechado mas nunca é aberto)`,i+1);
                        valid = false;
                        break;   
                    }
                }
                else if(lineType === "mustCondition")
                {
                    if(mustConditionValidation(lines,i))
                    {
                        let lineParsed = `${lines[i].trim()}\n`;
                        codeParsed += lineParsed;
                        totalCommands++;
                    }
                    else
                    {
                        let pos = predictFunction(lines,i);
                        badLuckFunctions += `badLuck([${pos[0]},${pos[1]}])\n`;
                        let lineParsed = `${lines[i].trim()}\n`;
                        codeParsed += lineParsed;
                        totalCommands++;
                    }
                }
                else
                {
                    let lineParsed = `${lines[i].trim()}\n`;
                    codeParsed += lineParsed;
                    totalCommands++;
                }
            }
            else
            {
                printError(lines[i],i+1);
                valid = false;
                break;
            }

            if(limit > 0 && totalCommands > limit)
            {
                document.getElementById('consoleArea').innerText += `Aviso: O código tem mais linhas do que o robô pode processar. Tente rescrever seu código em ${limit} linhas ou menos.\n`;
                valid = false;
                break;
            }
        }
        else
        {
            continue;
        }
    }

    if(valid)
    {
        codeParsed += `}${badLuckFunctions}runCode()\n`;
        return codeParsed;
    }
    else
    {
        return null;
    }
}