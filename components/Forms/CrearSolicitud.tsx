import router, { useRouter } from "next/router";
import React, { useState, useEffect, useContext, ReactNode } from "react";
import { Button, ButtonToolbar, SelectPicker, Uploader } from "rsuite";
import { AuthContext } from "../../context/AuthConext";
import getPeriodos from "../../hooks/useGetPeriodos";
import postSolicitud from "../../hooks/usePostSolicitud";
import useValidation from "../../hooks/useValidation";
import crearSolicitudValidation from "../../validations/crearSolicitudValidation";
import { formatoRut, validarRut } from "../../validations/validarRut";
import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";
import { Loader } from "rsuite";
import { ToastContainer, toast } from "react-toastify";
import InputMask from "react-input-mask";

const STATE_INIT = {
  name_benef: "",
  rut_benef: "",
  carrera_benef: "",
  type_benef: "",
  anio: "",
  comentario_funcionario: "",
  documentacion: [],
};

const CrearSolicitud = () => {
  const { authState } = useContext(AuthContext);
  const [aniosObject, setAniosObject]: any = useState([]);
  const [isLoged, setIsLoged] = useState(false);
  const MySwal = withReactContent(Swal);
  const router = useRouter();

  const fetchSolicitudApi = async () => {
    MySwal.fire({
      title: "¿Enviar solicitud?",
      text: "Una vez enviada puede editar esta desde la opción de mis solicitudes",
      icon: "info",
      showCancelButton: true,
      cancelButtonText: "Cancelar",
      confirmButtonColor: "#003057",
      cancelButtonColor: "#da291c",
      confirmButtonText: "Aceptar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsLoged(true);
        //@ts-ignore
        let user_id: string = authState.id;

        const submitSolicitud = await postSolicitud(
          name_benef,
          formatoRut(rut_benef),
          carrera_benef,
          type_benef,
          anio,
          comentario_funcionario,
          documentacion,
          user_id
        );
        if (submitSolicitud.mensaje === "Solicitud creada con exito") {
          router.push({ pathname: "/panel", query: { ok: true } });
        } else if (
          submitSolicitud.mensaje ===
          "Alumno con solicitud pendiente en sistema"
        ) {
          setIsLoged(false);
          toast.error(submitSolicitud.mensaje);
        }
        // ingresar verificaciones de backend!!!
      }
    });
  };

  useEffect(() => {
    const peticionPeriodos = async () => {
      const peticion = await getPeriodos();
      peticion.forEach((element: any) => {
        setAniosObject((oldArray: any) => [
          ...oldArray,
          { label: element.anio, value: element.anio },
        ]);
      });
    };
    peticionPeriodos();
  }, []);

  const { values, errores, handlerSubmit, handleChange, handlerBlur } =
    useValidation(STATE_INIT, crearSolicitudValidation, fetchSolicitudApi);
  let {
    name_benef,
    rut_benef,
    carrera_benef,
    type_benef,
    anio,
    comentario_funcionario,
    documentacion,
  } = values;

  return (
    <div className="container">
      {isLoged ? (
        <Loader size="lg" backdrop content="Cargando..." vertical />
      ) : (
        <div className="card card-form shadow-1 mt-2 mb-4">
          <div className="card-header">
            <p className="text-center">Crear Solicitud</p>
          </div>
          <div className="card-body">
            <form onSubmit={handlerSubmit}>
              <div className="row mb-3">
                <div className="col-12 col-sm-8 mb-3">
                  <label className="form-label" htmlFor="form6Example1">
                    Nombre del beneficiario
                  </label>
                  <input
                    placeholder="Ingrese nombre completo"
                    type="text"
                    id="name_benef"
                    name="name_benef"
                    className="form-control"
                    onChange={handleChange}
                    onBlur={handlerBlur}
                  />
                </div>
                <div className="col-12 col-sm-4">
                  <label className="form-label" htmlFor="form6Example2">
                    Rut Beneficiario
                  </label>
                  <input
                    placeholder="12345678-9"
                    type="text"
                    id="rut_benef"
                    name="rut_benef"
                    className="form-control"
                    onChange={handleChange}
                    onBlur={handlerBlur}
                  />
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-12 col-sm-8 mb-3">
                  <label className="form-label" htmlFor="form6Example1">
                    Carrera Beneficiario
                  </label>
                  <input
                    placeholder="Carrera UCN NOTA: ESTO DEBE SER UN DROPDOWN"
                    type="text"
                    id="carrera_benef"
                    name="carrera_benef"
                    className="form-control"
                    onChange={handleChange}
                    onBlur={handlerBlur}
                  />
                </div>
                <div className="col-12 col-sm-4">
                  <label className="form-label" htmlFor="form6Example1">
                    Tipo de matricula
                  </label>
                  <SelectPicker
                    searchable={false}
                    size="md"
                    placeholder="Alumno nuevo o antiguo"
                    style={{ width: "100%" }}
                    id="type_benef"
                    onChange={(e) => handleChange(e, "type_benef")}
                    onBlur={handlerBlur}
                    data={[
                      {
                        label: "Alumno nuevo",
                        value: "nuevo",
                      },
                      {
                        label: "Alumno antiguo",
                        value: "antiguo",
                      },
                    ]}
                  />
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-12 col-sm-12 mb-3">
                  <label className="form-label" htmlFor="form6Example1">
                    Año que aplica
                  </label>
                  <SelectPicker
                    onChange={(e) => handleChange(e, "anio")}
                    onBlur={handlerBlur}
                    size="md"
                    placeholder="Seleccione el año que aplica beca"
                    style={{ width: "100%" }}
                    id="anio"
                    data={aniosObject}
                  />
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-12 col-sm-12">
                  <label className="form-label" htmlFor="form6Example1">
                    Información adicional sobre la solicitud
                  </label>
                  <textarea
                    placeholder="Agregue cualquier información adicional para personal del departamento de personas o cobranzas"
                    onChange={handleChange}
                    onBlur={handlerBlur}
                    className="form-control"
                    id="comentario_funcionario"
                    name="comentario_funcionario"
                    rows={4}
                  ></textarea>
                </div>
              </div>
              <div className="row mb-3">
                <div className="col-12 col-sm-12">
                  <label className="form-label" htmlFor="form6Example1">
                    adjunte archivos
                  </label>
                  <Uploader
                    onChange={(e) => handleChange(e, "documentacion")}
                    action={" "}
                    draggable
                  >
                    <div style={{ width: "100%", height: 100 }}>
                      <h6>
                        Adjunte certificado de nacimiento u otro documento que
                        acredite parentesco. Puede arrastrar o hacer click
                      </h6>
                    </div>
                  </Uploader>
                </div>
              </div>
              <ToastContainer />

              <div className="row mb-3">
                <div className="col-12 col-sm-12 text-center">
                  <ButtonToolbar>
                    <Button className="px-5 mx-5 boton-enviar" type="submit">
                      Enviar
                    </Button>
                    <Button
                      onClick={() => router.push("/panel")}
                      className="px-5 mx-5 boton-cancelar"
                    >
                      Cancelar
                    </Button>
                  </ButtonToolbar>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CrearSolicitud;
