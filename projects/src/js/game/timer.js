const FORM_ACCESS = 'https://docs.google.com/forms/d/e/1FAIpQLSeTbA3iFSmgcNeCaFKuXEKQ0mOBg74mow2ISXzESXOI4afhOQ/formResponse';

export function displayTime(time,timerElement)
{
    let hour = Math.floor(time / 3600);
    let min = Math.floor(time / 60) % 60;
    let seg = Math.floor(time % 60);
    timerElement.innerText = `Tempo: ${hour < 10 ? '0' + hour : hour}:${(min < 10 ? '0' + min : min)}:${(seg < 10 ? '0' + seg : seg)}`;
}

async function uploadLog(data)
{
    return new Promise((resolve,reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open('POST',FORM_ACCESS,true);

        let formData = new FormData();
        for(let i = 0; i < data.length;i++)
        {
            formData.append(data[i][0],data[i][1]);
        }

        xhr.onreadystatechange = () => {
            if(xhr.readyState === XMLHttpRequest.DONE)
            {
                resolve(true);
            }
        };
        xhr.send(formData);
    });
}

export async function configureDataAndUpload(nameInput,ageInput,genderRadioName,progExpRadioName,subBtn,time,redirectPath,level)
{
    subBtn.addEventListener('click',async () => {
        let genderInput = document.querySelector(`input[name="${genderRadioName}"]:checked`);
        let progExpInput = document.querySelector(`input[name="${progExpRadioName}"]:checked`);
        let hour = Math.floor(time / 3600);
        let min = Math.floor(time / 60) % 60;
        let seg = Math.floor(time % 60);
        let name = nameInput.value;
        let age = ageInput.value;
        let gender = genderInput != null ? genderInput.value : null;
        let progExp = progExpInput != null ? progExpInput.value : null;
        if((name != null && name != '') && (age != null && age!= '') && (gender != null && gender != '') && (progExp != null && progExp != ''))
        {
            if(parseFloat(age) >= 1)
            {
                subBtn.disabled = true;
                let data = [
                    ['entry.1867777838',level],
                    ['entry.746491928',name],
                    ['entry.1029337756',age],
                    ['entry.1806882852',gender],
                    ['entry.1585862028',progExp],
                    ['entry.2140863999',`${hour < 10 ? '0' + hour : hour}:${(min < 10 ? '0' + min : min)}:${(seg < 10 ? '0' + seg : seg)}`]
                ];
                let success = await uploadLog(data);
                if(success)
                {
                    console.log(data);
                    window.location.href = redirectPath;
                }
                else
                {
                    alert("Ops! Algo deu errado!");
                    subBtn.disabled = false;
                }
            }
            else
            {
                alert("Valor da idade incorreto.");
            }
        }
        else
        {
            alert("É necessário preencher o formulário para avançar.");
        }
    });
}