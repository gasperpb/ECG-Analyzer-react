export const generateFHIRBundle = (data, patientInfo = {}) => {
  const observationResources = []

  if (data.bpm) {
    observationResources.push({
      resourceType: 'Observation',
      id: 'heart-rate',
      status: 'final',
      category: [{
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/observation-category',
          code: 'vital-signs',
          display: 'Vital Signs'
        }]
      }],
      code: {
        coding: [{
          system: 'http://loinc.org',
          code: '8867-4',
          display: 'Heart rate'
        }]
      },
      subject: { reference: `Patient/${patientInfo.id || 'unknown'}` },
      effectiveDateTime: data.timestamp || new Date().toISOString(),
      valueQuantity: {
        value: data.bpm,
        unit: 'beats/minute',
        system: 'http://unitsofmeasure.org',
        code: '/min'
      }
    })
  }

  if (data.spO2) {
    observationResources.push({
      resourceType: 'Observation',
      id: 'spo2',
      status: 'final',
      category: [{
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/observation-category',
          code: 'vital-signs',
          display: 'Vital Signs'
        }]
      }],
      code: {
        coding: [{
          system: 'http://loinc.org',
          code: '2708-6',
          display: 'Oxygen saturation in Arterial blood'
        }]
      },
      subject: { reference: `Patient/${patientInfo.id || 'unknown'}` },
      effectiveDateTime: data.timestamp || new Date().toISOString(),
      valueQuantity: {
        value: data.spO2,
        unit: '%',
        system: 'http://unitsofmeasure.org',
        code: '%'
      }
    })
  }

  if (data.systolic && data.diastolic) {
    observationResources.push({
      resourceType: 'Observation',
      id: 'blood-pressure',
      status: 'final',
      category: [{
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/observation-category',
          code: 'vital-signs',
          display: 'Vital Signs'
        }]
      }],
      code: {
        coding: [{
          system: 'http://loinc.org',
          code: '85354-9',
          display: 'Blood pressure panel with all children optional'
        }]
      },
      subject: { reference: `Patient/${patientInfo.id || 'unknown'}` },
      effectiveDateTime: data.timestamp || new Date().toISOString(),
      component: [
        {
          code: {
            coding: [{
              system: 'http://loinc.org',
              code: '8480-6',
              display: 'Systolic blood pressure'
            }]
          },
          valueQuantity: {
            value: data.systolic,
            unit: 'mmHg',
            system: 'http://unitsofmeasure.org',
            code: 'mm[Hg]'
          }
        },
        {
          code: {
            coding: [{
              system: 'http://loinc.org',
              code: '8462-4',
              display: 'Diastolic blood pressure'
            }]
          },
          valueQuantity: {
            value: data.diastolic,
            unit: 'mmHg',
            system: 'http://unitsofmeasure.org',
            code: 'mm[Hg]'
          }
        }
      ]
    })
  }

  if (data.glucose) {
    observationResources.push({
      resourceType: 'Observation',
      id: 'glucose',
      status: 'final',
      category: [{
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/observation-category',
          code: 'laboratory',
          display: 'Laboratory'
        }]
      }],
      code: {
        coding: [{
          system: 'http://loinc.org',
          code: '2339-0',
          display: 'Glucose [Mass/volume] in Blood'
        }]
      },
      subject: { reference: `Patient/${patientInfo.id || 'unknown'}` },
      effectiveDateTime: data.timestamp || new Date().toISOString(),
      valueQuantity: {
        value: data.glucose,
        unit: 'mg/dL',
        system: 'http://unitsofmeasure.org',
        code: 'mg/dL'
      }
    })
  }

  if (data.interpretation) {
    observationResources.push({
      resourceType: 'DiagnosticReport',
      id: 'ecg-report',
      status: 'final',
      category: [{
        coding: [{
          system: 'http://terminology.hl7.org/CodeSystem/v2-0074',
          code: 'CAR',
          display: 'Cardiology'
        }]
      }],
      code: {
        coding: [{
          system: 'http://loinc.org',
          code: '34534-8',
          display: 'ECG study'
        }]
      },
      subject: { reference: `Patient/${patientInfo.id || 'unknown'}` },
      effectiveDateTime: data.timestamp || new Date().toISOString(),
      issued: new Date().toISOString(),
      conclusion: data.interpretation,
      resultsInterpreter: data.diagnoses?.map(d => ({
        reference: `Practitioner/${d.name.replace(/\s/g, '_')}`,
        display: d.name
      })) || []
    })
  }

  const patientResource = {
    resourceType: 'Patient',
    id: patientInfo.id || 'unknown',
    name: [{
      family: patientInfo.lastName || 'Unknown',
      given: [patientInfo.firstName || 'Unknown']
    }],
    gender: patientInfo.gender || 'unknown',
    birthDate: patientInfo.birthDate || '1900-01-01'
  }

  const fhirBundle = {
    resourceType: 'Bundle',
    id: `ecg-${Date.now()}`,
    type: 'collection',
    timestamp: new Date().toISOString(),
    entry: [
      {
        fullUrl: `urn:uuid:patient-${patientInfo.id || 'unknown'}`,
        resource: patientResource
      },
      ...observationResources.map(obs => ({
        fullUrl: `urn:uuid:${obs.id}`,
        resource: {
          ...obs,
          subject: { reference: `urn:uuid:patient-${patientInfo.id || 'unknown'}` }
        }
      }))
    ]
  }

  return fhirBundle
}

export const exportToFHIR = (data, patientInfo = {}) => {
  const bundle = generateFHIRBundle(data, patientInfo)
  const json = JSON.stringify(bundle, null, 2)

  const blob = new Blob([json], { type: 'application/fhir+json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `FHIR-ECG-${patientInfo.id || 'unknown'}-${new Date().toISOString().split('T')[0]}.json`
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  return bundle
}

export const exportToHL7v2 = (data, patientInfo = {}) => {
  const patientName = `${patientInfo.lastName || 'UNKNOWN'}^${patientInfo.firstName || 'UNKNOWN'}`
  const patientId = patientInfo.id || 'UNKNOWN'
  const dob = patientInfo.birthDate || '19000101'
  const gender = patientInfo.gender || 'U'

  const timestamp = new Date()
  const msgDateTime = formatHL7DateTime(timestamp)

  let segments = []

  segments.push(`MSH|^~\\&|ECGAnalyzer|ECG_System|Hospital|Hospital|${msgDateTime}||ORU^R01|${Date.now()}|P|2.5`)

  segments.push(`PID|1||${patientId}||${patientName}||${dob}||${gender}`)

  segments.push(`OBR|1|||34534-8^ECG study^LN|||${msgDateTime}`)

  let obxCount = 1

  if (data.bpm) {
    segments.push(`OBX|${obxCount}|NM|8867-4^Heart rate^LN||${data.bpm}|beats/min|60-100|${getHRFlag(data.bpm)}|||F`)
    obxCount++
  }

  if (data.rhythm) {
    segments.push(`OBX|${obxCount}|ST|RHYTHM^Cardiac Rhythm||${data.rhythm}|||||F`)
    obxCount++
  }

  if (data.pr) {
    segments.push(`OBX|${obxCount}|NM|PR^PR Interval||${data.pr}|ms|120-200|${getIntervalFlag(data.pr, 120, 200)}|||F`)
    obxCount++
  }

  if (data.qrs) {
    segments.push(`OBX|${obxCount}|NM|QRS^QRS Duration||${data.qrs}|ms|80-120|${getIntervalFlag(data.qrs, 80, 120)}|||F`)
    obxCount++
  }

  if (data.qt) {
    segments.push(`OBX|${obxCount}|NM|QT^QT Interval||${data.qt}|ms|350-450|${getIntervalFlag(data.qt, 350, 450)}|||F`)
    obxCount++
  }

  if (data.spO2) {
    segments.push(`OBX|${obxCount}|NM|2708-6^Oxygen saturation^LN||${data.spO2}|%|95-100|${getSatFlag(data.spO2)}|||F`)
    obxCount++
  }

  if (data.interpretation) {
    segments.push(`OBX|${obxCount}|FT|INTERP^Interpretation||${data.interpretation}|||||F`)
    obxCount++
  }

  segments.push(`NTE|1|L|ECG Analyzer - Laudo gerado automaticamente`)
  segments.push(`NTE|2|L|Para fins educacionais - Não substitui avaliação médica`)

  const hl7Message = segments.join('\r\n')

  const blob = new Blob([hl7Message], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `HL7-ECG-${patientId}-${new Date().toISOString().split('T')[0]}.hl7`
  link.style.visibility = 'hidden'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)

  return hl7Message
}

function formatHL7DateTime(date) {
  return date.getFullYear().toString() +
    (date.getMonth() + 1).toString().padStart(2, '0') +
    date.getDate().toString().padStart(2, '0') +
    date.getHours().toString().padStart(2, '0') +
    date.getMinutes().toString().padStart(2, '0') +
    date.getSeconds().toString().padStart(2, '0')
}

function getHRFlag(bpm) {
  if (bpm < 60) return 'L'
  if (bpm > 100) return 'H'
  return 'N'
}

function getIntervalFlag(value, low, high) {
  if (value < low) return 'L'
  if (value > high) return 'H'
  return 'N'
}

function getSatFlag(spo2) {
  if (spo2 < 90) return 'LL'
  if (spo2 < 95) return 'L'
  return 'N'
}
